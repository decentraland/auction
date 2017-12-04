import { expect } from 'chai'

import { OutbidNotification, ParcelState } from '../src/lib/models'
import { OutbidNotificationService } from '../src/lib/services'
import db from '../src/lib/db'

describe('OutbidNotificationService', function() {
  let notificationService
  const email = 'abarmat@gmail.com'

  beforeEach(() => {
    const SMTPClient = {
      setTemplate: () => undefined,
      sendMail: (email, template, opts) => console.log(email)
    }

    notificationService = new OutbidNotificationService()
    notificationService.smtp = SMTPClient
  })

  describe('notificateOutbid', () => {
    it('should throw if the supplied parcel state id does not exist', () => {
      return expect(
        notificationService.notificateOutbid(22)
      ).to.be.rejectedWith(
        'The parcel state 22 does not exist or has been deleted.'
      )
    })
  })

  describe('summary email', () => {
    it('send summary email with only updated parcels', async () => {
      const parcels = [[1, 1], [1, 2]]
      const lastUpdatedHours = 8
      const updatedDate = OutbidNotificationService.hoursAgoToDate(4)
      const expiredDate = OutbidNotificationService.hoursAgoToDate(12)

      // insert parcel states
      await ParcelState.insert({
        x: 1,
        y: 1,
        amount: '1000',
        address: '0xdead',
        endsAt: new Date(),
        bidGroupId: 1,
        bidIndex: 0,
        projectId: null,
        updatedAt: updatedDate
      })
      await ParcelState.insert({
        x: 1,
        y: 2,
        amount: '2000',
        address: '0xbeef',
        endsAt: new Date(),
        bidGroupId: 1,
        bidIndex: 0,
        projectId: null,
        updatedAt: updatedDate
      })
      await ParcelState.insert({
        x: 1,
        y: 3,
        amount: '1000',
        address: '0xdead',
        endsAt: new Date(),
        bidGroupId: 1,
        bidIndex: 0,
        projectId: null,
        updatedAt: updatedDate
      })
      await ParcelState.insert({
        x: 1,
        y: 4,
        amount: '1000',
        address: '0xdead',
        endsAt: new Date(),
        bidGroupId: 1,
        bidIndex: 0,
        projectId: null,
        updatedAt: expiredDate
      })

      // insert notifications
      await Promise.all(
        parcels.map(coords =>
          OutbidNotification.insert({
            email,
            parcelStateId: ParcelState.hashId(...coords)
          })
        )
      )

      // send email
      const results = await notificationService.sendSummaryMail(
        email,
        lastUpdatedHours
      )

      // text is good
      expect(results.summary.text).to.be.equal(
        'This is the summary of parcel outbids from the last notification:\n\nThe parcel 1,1 now belongs to 0xdead for 1000.\nVisit https://auction.decentraland.org/parcels/1,1 to place a new bid!\n\nThe parcel 1,2 now belongs to 0xbeef for 2000.\nVisit https://auction.decentraland.org/parcels/1,2 to place a new bid!\n\n'
      )

      // selected the right parcels
      expect(results.parcelIds).to.be.eql(['1,1', '1,2'])
    })
  })

  afterEach(() =>
    Promise.all(
      ['jobs', 'outbid_notifications', 'parcel_states'].map(db.truncate.bind(db))
    )
  )
})
