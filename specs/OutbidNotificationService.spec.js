import { expect } from 'chai'
import sinon from 'sinon'

import { OutbidNotificationService } from '../src/lib/services'

const noop = () => undefined

describe('OutbidNotificationService', function() {
  let notificationService
  let SMTPClient
  let OutbidNotification
  let ParcelState
  let Job

  beforeEach(() => {
    SMTPClient = { setTemplate: noop, sendEmail: noop }

    OutbidNotification = {
      findActiveByParcelId: noop,
      deactivate: noop
    }
    ParcelState = { findOne: noop }
    Job = { perform: noop }

    notificationService = new OutbidNotificationService()
    notificationService.OutbidNotification = OutbidNotification
    notificationService.ParcelState = ParcelState
    notificationService.Job = Job
  })

  describe('notificateOutbid', function() {
    it('should throw if the supplied parcel state id does not exist', function() {
      return expect(
        notificationService.notificateOutbid(22)
      ).to.be.rejectedWith(
        'The parcel state 22 does not exist or has been deleted.'
      )
    })
  })
})
