import { env, SMTP } from "decentraland-commons";
import { OutbidNotification, Job, ParcelState } from "../models";

const TEMPLATE_NAME = "outbid";

class OutbidNotificationService {
  constructor(SMTPClient) {
    this.OutbidNotification = OutbidNotification;
    this.ParcelState = ParcelState;
    this.Job = Job;
    this.smpt = null;

    this.setSMPTClient(SMTPClient);
  }

  setSMPTClient(SMTPClient = SMTP) {
    const emailSender = env.get("MAIL_SENDER");
    const transportOptions = {
      hostname: env.get("MAIL_HOSTNAME"),
      port: env.get("MAIL_PORT"),
      username: env.get("MAIL_USERNAME"),
      password: env.get("MAIL_PASS")
    };

    this.smpt = new SMTPClient(transportOptions);

    this.smpt.setTemplate(TEMPLATE_NAME, opts => ({
      from: `The Decentraland Team <${emailSender}>`,
      to: opts.email,
      subject: "The Pacel has been outbid!",
      text: `The parcel ${opts.x},${opts.y} now belongs to ${opts.address} for ${opts.amount}.
          Visit auction.decentrlaand.org/parcels/${opts.x},${opts.y} to place a new bid!`,
      html: `<p>The parcel ${opts.x},${opts.y} now belongs to ${opts.address} for ${opts.amount}.</p><p>Visit auction.decentrlaand.org/parcels/${opts.x},${opts.y} to place a new bid!</p>`
    }));

    return this;
  }

  async notificateOutbids(parcelStates) {
    for (let parcelState of parcelStates) {
      await this.notificateOutbid(parcelState.id);
    }
  }

  async notificateOutbid(parcelStateId) {
    const parcelState = await this.ParcelState.findOne(parcelStateId);
    if (!parcelState) {
      throw new Error(
        `The parcel state ${parcelStateId} does not exist or has been deleted.`
      );
    }

    const notifications = await this.OutbidNotification.findActiveByParcelStateId(
      parcelStateId
    );

    for (let { id, email } of notifications) {
      await this.Job.perform(
        {
          type: "outbid_notification",
          referenceId: id,
          data: { parcelStateId, email }
        },
        async () => {
          await this.sendMail(email, parcelState);
          await this.OutbidNotification.deactivate(id);
        }
      );
    }
  }

  async sendMail(email, parcelState) {
    return await this.smtp.sendMail({ email }, TEMPLATE_NAME, {
      ...parcelState,
      email
    });
  }
}

export default OutbidNotificationService;
