# Contributing to SCRATCH-MAP

## Table of Contents
  * [Who Can Contribute](#who-can-contribute)
  * [How You Can Contribute](#how-you-can-contribute)
    * [Reporting Issues and Bugs](#reporting-issues-and-bugs)
    * [Suggesting Improvements and Features](#suggesting-improvements-and-features)
    * [Adding Features](#adding-features)
  * [Contributing Guide](#contributing-guide)
    * [Adding Functionality](#adding-functionality)
    * [Adding Maps](#adding-maps)

## Who Can Contribute
In short, anyone. All that I ask is that you familiarize yourself with the project, the idea behind it (simplicity), the [README](README.md), and this document. This project is meant to be open and contributed to by the public, so feel free to improve upon it.

<br/>

## How You Can Contribute

### Reporting Issues and Bugs
If you come across any issues or bugs while using the application, document the issue as best as you can. After doing so, please open an issue with the `bug` label.

### Suggesting Improvements and Features
If you have any ideas for improving the project, feel free to open up an issue with the `enhancement` label and do your best to thoughoughly explain the desire improvement. I will warn you though, I may opt to not implement the feature in favor of keeping the application simple. If that is the case, you are more than welcome to implement the feature yourself and open up a pull request

### Adding Features
If you would like to add a feature, you are more than welcome to. To do so, fork the project and implement your changes. After making your changes, you can open a pull request and an issue (labeled `enhancement`) referncing the afforementioned pull request.

<br/>

## Contributing Guide
These are a few examples of contributions and how they might take place.

### Adding Functionality
Examples of functionality are authentication, additional pages and inputs, etc. To add additional features, please do so following the [Adding Features](#adding-features) guidelines. On top of that, if you remove or heavily modify existing features to the point of unusability, there is a good chance your changes will not be implemented.

### Adding Maps
To add maps, there are a few things that will need to be added and/or modified.

Example of adding a map of Canadian Provinces/Territories:

  * Creation of the map SVG file.
    * The SVG must follow the structure of the existing maps.
    * Try to keep the width:height scale 2:1, e.g. 1200x600
    * Remove all styling (using map.css only) except for necessary text styling (size, etc.)
      * SVG
        * Type: svg
        * Attributes
          * id="svg-map"
          * viewBox="0 0 1200 600"
          * width="1200"
          * height="600"
      * Top Level Group (group of entities/countries/states)
        * Type: group
        * Attributes
          * id="entities"
          * class="entities"
      * Individual entities/countries/states (group of paths/text/label-xxx)
        * Type: group
        * Attributes
          * id="<2-LETTER-CODE>"
        * Label
          * Text
            * Type: text
            * Attributes
              * id="<2-LETTER-CODE-text>
              * class="label-text"
          * Box (Only if main body cannot contain Text)
            * Type: rect
            * Attributes
              * id="<2-LETTER-CODE-box>
              * class="label-box"
          * Connector (Only if main body cannot contain Text)
            * Type: path
            * Attributes
              * id="<2-LETTER-CODE-connector>
              * class="label-connector"

    * EXAMPLE:
      ```
      public/images/canada.svg

      <svg id="svg-map">
        <g class="provinces">
          <g id="AB">
            <path xxxxx/>
            <path xxxxx/>
            
            <text id="AB-text" class="label-text">
              <span>AB</span>
            </text>
          </g>

          <g id="NS">
            <path d="xxxxx" />
            <path d="xxxxx" />
            
            <text id="NS-text" class="label-text">
              <span>NS</span>
            </text>

            <path
              id="NS-connector"
              class="label-connector
              d="xxxxx" />
            
            <rect id="NS-box" class="label-box"
              width="xxx" height="xxx" />
          </g>

          ...

        </g>
      </svg>
      ```

  * Creation of the database file.
    * The JSON must follow the same structure as the others.
      * "2-LETTER-CODE": "NAME"
    * EXAMPLE:
      ```
      utils/canada.json

      {
        "AB": "Alberta",
        "QC": "Quebec",

        ...

      }
      ```

  * Add 'canada' to validTypes in the database.js file.
    * EXAMPLE:
      ```
      utils/database.js

      const validTypes = [..., 'canada'];
      ```