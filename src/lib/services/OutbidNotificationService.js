import { env } from "decentraland-commons";
import { OutbidNotification, ParcelState } from "../models";

const TEMPLATE_NAME = "outbid";

export default class OutbidNotificationService {
  constructor(SMTP) {
    this.OutbidNotification = OutbidNotification;
    this.ParcelState = ParcelState;

    this.smpt = this.setupNewSMPTClient(SMTP);
  }

  setupNewSMPTClient(SMTP) {
    const emailSender = env.getEnv("MAIL_SENDER");
    const transportOptions = {
      hostname: env.getEnv("MAIL_HOSTNAME"),
      port: env.getEnv("MAIL_PORT"),
      username: env.getEnv("MAIL_USERNAME"),
      password: env.getEnv("MAIL_PASS")
    };

    this.smpt = new SMTP(transportOptions);

    this.smpt.setTemplate(TEMPLATE_NAME, opts => ({
      from: `The Decentraland Team <${emailSender}>`,
      to: opts.email,
      subject: "The Pacel has been outbid!",
      text: `The parcel ${opts.x},${opts.y} now belongs to ${opts.address} for ${opts.amount}.
          Visit auction.decentrlaand.org/parcels/${opts.x},${opts.y} to place a new bid!`,
      html: `<p>The parcel ${opts.x},${opts.y} now belongs to ${opts.address} for ${opts.amount}.</p><p>Visit auction.decentrlaand.org/parcels/${opts.x},${opts.y} to place a new bid!</p>`
    }));
  }

  async parcelStateOutbid(parcelStateId) {
    const parcelState = await this.ParcelState.findOne(parcelStateId);
    if (!parcelState) {
      throw new Error(
        `The parcel state ${parcelStateId} does not exist or has been deleted.`
      );
    }

    const notifications = await this.OutbidNotification.findActiveByParcelId(
      parcelStateId
    );

    for (let { email, id } of notifications) {
      await this.smtp.sendMail({ email }, TEMPLATE_NAME, {
        ...parcelState,
        email
      });
      await this.OutbidNotification.deactivate(id);
    }
  }
}
