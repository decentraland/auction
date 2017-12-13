#!/usr/bin/env babel-node

import fs from 'fs'
import { promisify } from 'util'
import program from 'commander'
import inquirer from 'inquirer'

import { env } from 'decentraland-commons'

import GoogleSpreadsheet from 'google-spreadsheet'
import PNGImage from 'pngjs-image'


env.load()

export const defaultUrl = '1VMOOs0M5s2elBKzD7sWbue9RRM3vkyskosWiC5wl0SE'

export async function createImage(mapInfo) {
  const image = PNGImage.createImage(301, 301);
  const road = { red: 0, green: 0, blue: 0, alpha: 100 }
  const district = { red: 222, green: 91, blue: 199, alpha: 100 }
  const plaza = { red: 255, green: 255, blue: 255, alpha: 100 }

  mapInfo.forEach((row, index) => {
    for (let xValue = -150, x = 0; xValue <= 150; xValue++, x++) {
      const key = 't' + xValue
      const value = row[key] && row[key].toLowerCase()
      if (value) {
        if (value === 'r') {
          image.setAt(x, index, road)
        } else if (value === 'p') {
          image.setAt(x, index, plaza)
        } else {
          image.setAt(x, index, district)
        }
      }
    }
  })
  return image
}

export async function getMap(url) {
  const doc = new GoogleSpreadsheet(url)
  const getInfo = promisify(doc.getInfo.bind(doc))
  const info = await getInfo()
  const readRows = async (sheet, ...args) => await (promisify(sheet.getRows.bind(sheet)))(...args)
  const mapInfo = await readRows(info.worksheets[1])

  return mapInfo
}

export async function run(url) {
  const mapInfo = await getMap(url)
  const image = await createImage(mapInfo)
  image.writeImage('minimap.png', (err) => {
    if (err) {
      return console.log(`Problem writing image: ${err.stack}`)
    }
    return console.log(`Image written`)
  })
}

if (!module.parent) {
  run(defaultUrl)
    .catch(err => console.log(err.stack))
}

