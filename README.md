# LPL Orbitfy Dashboard

![Project Logo](https://github.com/LittlePlaceLabs/Orbitfy-LPL-Dashboard/assets/139549023/795f881d-eb05-4e71-adf2-6c9e180880ed)


## Table of Contents
- [Project Overview](#project-overview)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Installation](#installation)
- [Deployment](#deployment)

## Project Overview

Welcome to LPL's Orbitfy Dashboard, an interactive dashboard for managing and analyzing images using Machine Learning. This project provides a user-friendly interface for uploading, selecting, and interacting with images, along with features for data filtering and real-time updates.

## Demo

https://d3jq6hipq6zlyl.cloudfront.net/

## Technologies Used

- React: The front-end framework for building a dynamic and responsive user interface.
- Material-UI: A library for creating consistent and aesthetically pleasing UI components.
- AWS S3: For storing and retrieving image files.
- WebSocket: Facilitating real-time updates for image management.
- JWT Authentication: Ensuring secure access to the dashboard.
- React Query: For efficient data fetching and state management.
- Lodash: A utility library for simplifying JavaScript operations.
- MUI Popover: Used for creating filter options.
- React Hot Toast: For displaying user-friendly notifications.
- TailwindCSS: for styling and utility classes.

## Getting Started

To get started with Dashboard, follow these simple steps:

- Log in using your LPL email.
- Upload images for analysis or comparison.
- Use the image selector pane to explore and interact with images.
- Filter images by model name to streamline your analysis.
- Enjoy real-time updates via WebSocket connections.
- Utilize the image comparison view and metrics table for detailed insights.

### Installation

- Run `npm install` to install all the required packages for the project.
- Then run `npm start` to fire up a local server.
- Go to `http://localhost:3000` from your browser.


## Deployment

- Run `npm run build` command in the root of the project
- Take the build file and upload it to the `dev-lpl-dash-hosted` bucket in AWS S3
- Go to cloudfront and open the instance which have `dev-lpl-dash-hosted` as origin.
- Now go to `Invalidations` Tab in that Cloudfront instance
- Create New Invalidation and type `/*` in the Add Object Paths text field.
- Now wait for the invalidation to complete and then refresh the Cloudfront URL.

