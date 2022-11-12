# SCRATCH-MAP

![logo](https://user-images.githubusercontent.com/11009228/201435148-647ed019-7cec-4e75-bce9-a4d1972fb4e9.jpg)

<p style="text-align: center;">An open-source scratch-off style map to track your travels.</p>
<br/>

## Features
  * World Map
  * US States Map
  * Date Traveled To Location
  * Link a Photo Album URL to a Scratch

<br/>

## World Map

### Countries
Baseline (Common Names): https://en.wikipedia.org/wiki/List_of_sovereign_states

Codes: https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes

**Differences:**
* Bahamas, The -> Bahamas
* Cape Verde -> Cabo Verde
* Gambia, The -> Gambia
* Micronesia, Federated States of -> Micronesia
* Sahrawi Arab Democratic Republic -> Western Sahara

**Not Listed:**
* Abkhazia
* Artsakh
* Cook Islands (See below)
* Kosovo
* Niue (See below)
* Northern Cyprus
* Somaliland
* South Ossetia
* Transnistria

### Countries VS Territories
Some territories have been listed independently, while others have been kept under the primary country listing.

**Territories listed separately:**
* United States
  * American Samoa
  * Guam
  * Puerto Rico
  * U.S. Virgin Islands
  * Marshall Islands
  * Micronesia
  * Palau
* United Kingdom
  * Bermuda
  * Cayman Islands
  * Falkland Islands
  * British Virgin Islands
  * Gibraltar
  * Turks and Caicos Islands
* China
  * Hong Kong
  * Taiwan
* Denmark
  * Greenland
* France
  * French Guiana
* Netherlands
  * Aruba

**Territories under primary country:**
* United States
  * United States Minor Outlying Islands
  * Northern Mariana Islands
* United Kingdom
  * Anguilla
  * British Indian Ocean Territory
  * Montserrat
  * Pitcairn Islands
  * Saint Helena, Ascension and Tristan da Cunha
  * South Georgia and the South Sandwich Islands
  * Guernsey
  * Isle of Man
  * Jersey
* France
  * Mayotte
  * Reunion
  * Martinique
  * Guadeloupe
  * New Caledonia
  * French Polynesia
  * Saint Martin
  * Wallis and Futuna
  * Saint Pierre and Miquelon
  * Saint Barthelemy
* Australia
  * Norfolk Island
  * Cocos Islands
  * Christmas Island
  * Heard Island and McDonald Islands
* Netherlands
  * Bonaire, Saint Eustatius and Saba
  * Sint Maarten
  * Curacao
* New Zealand
  * Tokelau
  * Cook Islands
  * Niue
* Norway
  * Svalbard and San Mayen
  * Bouvet Island
* China
  * Macao
* Serbia
  * Kosovo
* Finland
  * Aland Islands
* Denmark
  * Faroe Islands

<br/>

## US Map
Contains the 50 official US States plus Washington DC.
No territories are included on this map.

<br/>

## Credits
* World Map SVG
  * https://commons.wikimedia.org/wiki/File:BlankMap-World.svg
  * The SVG was modified heavily by myself to add labels and individual borders.
* US Map SVG
  * https://commons.wikimedia.org/wiki/File:Blank_US_Map_With_Labels.svg
  * This map was only slightly altered.
* pan/zoom on the SVGs
  * https://github.com/luncheon/svg-pan-zoom-container

<br/>

## Running
**Docker**

[![Docker Hub](https://img.shields.io/badge/DockerHub-image-blue?logo=docker&style=plastic)](https://hub.docker.com/r/ad3m3r5/scratch-map) ![Docker Image Size (tag)](https://img.shields.io/docker/image-size/ad3m3r5/scratch-map/latest?logo=docker&style=plastic)

The commands to create the data directory and set permissions are Linux specific.

```
mkdir -p /opt/docker/scratch-map/data

chown -R 1000:1000 /opt/docker/scratch-map/data

docker run -d --restart=always --name scratch-map -p 8080:8080 \
  -e PORT=8080 -e DBLOCATION=/data \
  -v /opt/docker/scratch-map/data:/data \
  ad3m3r5/scratch-map:latest
```

**Any OS Using NPM**
* Set ENV vars (see below) somewhere they will persist
* `npm install`
* `npm run`

### Environment Variables
  * `process.env.DBLOCATION`
    * (recommended) somewhere outside of app dir for update compatibility
    * DEFAULT: APPDIR/data/
  * `process.env.PORT`
    * (optional) port for app to run on
    * DEFAULT: 3000

<br/>

## Tech Stack
* nodeJS (18.12.0)
* express
* pug
* lowdb
* nodemon

<br/>

## Screenshots

![image](https://user-images.githubusercontent.com/11009228/201389392-2dfeabac-0ce3-4aca-9706-88a49b5cb746.png)

![image](https://user-images.githubusercontent.com/11009228/201389466-269d0fe5-88e0-42d6-bd9e-fe1fe79befb8.png)

![image](https://user-images.githubusercontent.com/11009228/201389578-262e80b1-a6ab-407c-baf2-bcb803789778.png)

![image](https://user-images.githubusercontent.com/11009228/201389708-1e3643a1-1cf6-4f23-98ec-e34a72acafd0.png)
