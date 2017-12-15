#!/usr/bin/env babel-node

import fs from 'fs'
import { promisify } from 'util'
import program from 'commander'
import inquirer from 'inquirer'

import { env } from 'decentraland-commons'

import GoogleSpreadsheet from 'google-spreadsheet'

env.load()

export const defaultUrl = '1VMOOs0M5s2elBKzD7sWbue9RRM3vkyskosWiC5wl0SE'

export async function checkInfo(generalInfo, mapInfo, districtsInfo) {
  return
}

export async function writeInfo(output, generalInfo) {
  output.x = {
    min: generalInfo[0].value,
    max: generalInfo[1].value
  }
  output.y = {
    min: generalInfo[2].value,
    max: generalInfo[3].value
  }
}

export async function writeProjects(output, mapInfo, districtsInfo) {
  output.reserved = {
    'Genesis Plaza': []
  }
  output.roads = []
  const target = {}
  districtsInfo.forEach(district => {
    output.reserved[district.name] = []
    target[district.idmap] = output.reserved[district.name]
  })
  target['r'] = output.roads
  target['p'] = output.reserved['Genesis Plaza']

  mapInfo.forEach((row, index) => {
    const yValue = output.y.max - index
    for (let xValue = output.x.min; xValue <= output.x.max; xValue++) {
      const key = 't' + xValue
      const value = row[key] && row[key].toLowerCase()
      if (value && target[value]) {
        target[value].push(`${xValue},${yValue}`)
      }
    }
  })
}

const sum = (items, selector) =>
  items.reduce((sum, item) => sum + selector(item), 0)

export async function writeLookup(output, mapInfo, map, district) {
  output.lookup = {}
  Object.keys(output.reserved).forEach(name => {
    const coords = output.reserved[name]
    const split = coords.map(coords => coords.split(','))
    const sumX = sum(split, item => parseInt(item[0]))
    const sumY = sum(split, item => parseInt(item[1]))
    output.lookup[name] = `${Math.floor(sumX / coords.length)},${Math.floor(
      sumY / coords.length
    )}`
  })
}

export async function getAll(url) {
  const doc = new GoogleSpreadsheet(url)
  const getInfo = promisify(doc.getInfo.bind(doc))
  const info = await getInfo()
  const readRows = async (sheet, ...args) =>
    await promisify(sheet.getRows.bind(sheet))(...args)
  const generalInfo = await readRows(info.worksheets[0])
  const mapInfo = await readRows(info.worksheets[1])
  const districtInfo = await readRows(info.worksheets[2])

  return { generalInfo, mapInfo, districtInfo }
}

// const { getAll, defaultUrl, writeSize, writeProjects, writeLookup } = require('./loadSheet'); var e = {}; getAll(defaultUrl).then(f => e = f)

export async function run(url) {
  const { generalInfo, mapInfo, districtInfo } = await getAll(url)
  console.log(generalInfo)
  const finalData = {}

  checkInfo(mapInfo, districtInfo)

  await writeInfo(finalData, generalInfo)
  await writeProjects(finalData, mapInfo, districtInfo)
  await writeLookup(finalData, mapInfo, districtInfo)

  fs.writeFileSync('./parcel.output.json', JSON.stringify(finalData, null, 2))
}

if (!module.parent) {
  run(defaultUrl)
    .then(() => console.log('End.'))
    .catch(err => console.log(err.stack))
}
