import { env, SMTP } from 'decentraland-commons'
import { OutbidNotification, Job, ParcelState } from '../models'

const SINGLE_TEMPLATE_NAME = 'outbid-single'
const SIMPLE_TEMPLATE_NAME = 'outbid-multi'

class OutbidNotificationService {
  constructor(SMTPClient) {
    this.OutbidNotification = OutbidNotification
    this.ParcelState = ParcelState
    this.Job = Job
    this.smtp = null

    this.setSMTPClient(SMTPClient)
  }

  static hoursAgoToDate(hours) {
    return new Date(new Date().getTime() - hours * 3600 * 1000)
  }

  setSMTPClient(SMTPClient = SMTP) {
    const emailSender = env.get('MAIL_SENDER')
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
      text: `The parcel ${opts.x},${opts.y} now belongs to ${opts.address} for ${opts.amount}.
          Visit auction.decentraland.org/parcels/${opts.x},${opts.y} to place a new bid!`,
      html: `<p>The parcel ${opts.x},${opts.y} now belongs to ${opts.address} for ${opts.amount}.</p><p>Visit auction.decentraland.org/parcels/${opts.x},${opts.y} to place a new bid!</p>`
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

  buildSummary(parcelStates) {
    let text = 'This is the summary of parcel outbids from the last notification:\n\n'
    let html = '<p>This is the summary of parcel outbids from the last notification:</p>'

    for (const parcel of parcelStates) {
      text += `The parcel ${parcel.x},${parcel.y} now belongs to ${parcel.address} for ${parcel.amount}.\n`
      text += `Visit https://auction.decentraland.org/parcels/${parcel.x},${parcel.y} to place a new bid!\n\n`

      html += `<p>The parcel ${parcel.x},${parcel.y} now belongs to ${parcel.address} for ${parcel.amount}.</p>`
      html += `<p>Visit https://auction.decentraland.org/parcels/${parcel.x},${parcel.y} to place a new bid!</p>`
    }
    console.log(text)
    return {text, html}
  }

  async sendAllSummaryMails() {
    const emails = await this.OutbidNotification.findSubscribedEmails()
    for (const email of emails) {
      await this.sendSummaryMail(email)
    }
  }

  async sendSummaryMail(email, hoursAgo) {
    // get active notifications for user
    const parcelIds = await this.OutbidNotification.findActiveByEmail(email)
      .then(rows => rows.map(row => row.parcelStateId))
    if (parcelIds.length === 0) {
      return false
    }

    // find updated parcels
    const parcelStates = await this.ParcelState.findByUpdatedSince(
      parcelIds, OutbidNotificationService.hoursAgoToDate(hoursAgo)
    )
    if (parcelStates.length === 0) {
      return false
    }

    // send mail
    const subject = 'Summary of the Decentraland auction'
    await this.Job.perform(
      {
        type: 'outbid_notification_multi',
        referenceId: 0,
        data: { parcelStates, email }
      },
      async () => {
        await this.sendMail(email, SIMPLE_TEMPLATE_NAME, {
          ...this.buildSummary(parcelStates), subject
        })
      }
    )
    return true
  }

  sendMail(email, template, opts) {
    return this.smtp.sendMail({ email }, SIMPLE_TEMPLATE_NAME, {
      ...opts, 
      email
    })
  }
}

export default OutbidNotificationService
