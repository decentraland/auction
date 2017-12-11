import { env, SMTP } from 'decentraland-commons'

import EJS from 'ejs'
import { OutbidNotification, Job, ParcelState } from '../models'

const SINGLE_TEMPLATE_NAME = 'outbid-single'
const SIMPLE_TEMPLATE_NAME = 'outbid-multi'

class OutbidNotificationService {
  constructor(SMTPClient) {
    this.OutbidNotification = OutbidNotification
    this.ParcelState = ParcelState
    this.Job = Job
    this.smtp = null

    this.appUrl = env.get('APP_URL')
    if (!this.appUrl) {
      throw new Error('Missing required env APP_URL')
    }

    this.setSMTPClient(SMTPClient)
  }

  static hoursAgoToDate(hours) {
    return new Date(new Date().getTime() - hours * 3600 * 1000)
  }

  toParcelLink(opts) {
    return `${this.appUrl}/${opts.x}/${opts.y}`
  }

  setSMTPClient(SMTPClient = SMTP) {
    const emailSender = env.get('MAIL_SENDER')
    if (!emailSender) {
      throw new Error('Missing env var MAIL_SENDER')
    }

    const transportOptions = {
      hostname: env.get('MAIL_HOSTNAME'),
      port: env.get('MAIL_PORT'),
      username: env.get('MAIL_USERNAME'),
      password: env.get('MAIL_PASS')
    }

    this.smtp = new SMTPClient(transportOptions)

    // load templates
    this.smtp.setTemplate(SINGLE_TEMPLATE_NAME, opts => ({
      from: `The Decentraland Team <${emailSender}>`,
      to: opts.email,
      subject: 'The Parcel has been outbid!',
      text: `The parcel ${opts.x},${opts.y} now belongs to ${opts.address} for ${opts.amount}. Visit ${this.toParcelLink(
        opts
      )} to place a new bid!`,
      html: `<p>The parcel ${opts.x},${opts.y} now belongs to ${opts.address} for ${opts.amount}.<br/>Visit ${this.toParcelLink(
        opts
      )} to place a new bid!</p>`
    }))

    this.smtp.setTemplate(SIMPLE_TEMPLATE_NAME, opts => ({
      from: `The Decentraland Team <${emailSender}>`,
      to: opts.email,
      subject: opts.subject,
      text: opts.text,
      html: opts.html
    }))

    return this
  }

  async notificateOutbids(parcelStates) {
    for (let parcelState of parcelStates) {
      await this.notificateOutbid(parcelState.id)
    }
  }

  async notificateOutbid(parcelStateId) {
    const parcelState = await this.ParcelState.findOne(parcelStateId)
    if (!parcelState) {
      throw new Error(
        `The parcel state ${parcelStateId} does not exist or has been deleted.`
      )
    }

    const notifications = await this.OutbidNotification.findActiveByParcelStateId(
      parcelStateId
    )

    for (let { id, email } of notifications) {
      await this.Job.perform(
        {
          type: 'outbid_notification',
          referenceId: id,
          data: { parcelStateId, email }
        },
        async () => {
          await this.sendMail(email, SINGLE_TEMPLATE_NAME, parcelState)
          await this.OutbidNotification.deactivate(id)
        }
      )
    }
  }

  async buildSummary(email, parcelStates) {
    const html = await new Promise((resolve, reject) => {
      EJS.renderFile(
        './src/templates/newsletter.ejs',
        {
          appUrl: this.appUrl,
          email: email,
          parcelStates: parcelStates
        },
        (err, html) => {
          err ? reject(err) : resolve(html)
        }
      )
    })

    let text =
      'This is the summary of parcel outbids from the last notification:\n\n'
    for (const parcel of parcelStates) {
      text += `The parcel ${parcel.x},${parcel.y} now belongs to ${parcel.address} for ${parcel.amount}.\n`
      text += `Visit ${this.toParcelLink(parcel)} to place a new bid!\n\n`
    }

    return { text, html }
  }

  async sendAllSummaryMails(hoursAgo) {
    const results = {}
    const emails = await this.OutbidNotification.findSubscribedEmails()

    for (const email of emails) {
      try {
        results[email] = await this.sendSummaryMail(email, hoursAgo)
      } catch (err) {
        results[email] = err
      }
    }

    return results
  }

  async sendSummaryMail(email, hoursAgo) {
    // check if is time to send
    const isTimeToSend = date => (new Date() - date) / 1000 > hoursAgo * 3600

    const lastJob = await Job.findLastByReferenceId(email)
    if (lastJob && !isTimeToSend(lastJob.createdAt)) {
      throw new Error(`Last notification sent less than ${hoursAgo} hours ago`)
    }

    // get active notifications for user
    const parcelIds = await this.OutbidNotification
      .findActiveByEmail(email)
      .then(rows => rows.map(row => row.parcelStateId))
    if (parcelIds.length === 0) {
      throw new Error(`No active notifications found for user ${email}`)
    }

    // find updated parcels
    const parcelStates = await this.ParcelState.findByUpdatedSince(
      parcelIds,
      OutbidNotificationService.hoursAgoToDate(hoursAgo)
    )
    if (parcelStates.length === 0) {
      throw new Error(`No updated parcels found for user ${email}`)
    }

    // send mail
    const subject = 'Summary of the Decentraland auction'
    const summary = this.buildSummary(email, parcelStates)
    await this.Job.perform(
      {
        type: 'outbid_notification_multi',
        referenceId: email,
        data: { parcelStates, email }
      },
      async () => {
        await this.sendMail(email, SIMPLE_TEMPLATE_NAME, {
          ...summary,
          subject
        })
      }
    )

    return {
      parcelIds,
      parcelStates,
      summary
    }
  }

  sendMail(email, template, opts) {
    return this.smtp.sendMail({ email }, SIMPLE_TEMPLATE_NAME, {
      ...opts,
      email
    })
  }
}

export default OutbidNotificationService
