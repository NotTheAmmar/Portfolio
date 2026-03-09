# Portfolio Data MongoDB Schema Documentation

This document describes the structure of the data stored in the MongoDB database for the portfolio application. The schema is defined in `server/models/Portfolio.js`.

## Root Object (Collection: `portfolios`)

| Field                | Type   | Description                             | Required |
| -------------------- | ------ | --------------------------------------- | -------- |  
| `profileInformation` | Object | Basic profile information (aka basics). | Yes      |
| `work`               | Array  | Employment history.                     | No       |
| `education`          | Array  | Educational background.                 | No       |
| `skills`             | Array  | List of skills.                         | No       |
| `projects`           | Array  | Project details.                        | No       |
| `certificates`       | Array  | Certifications and licenses.            | No       |
| `publications`       | Array  | Publications and papers.                | No       |
| `awards`             | Array  | Awards and honors.                      | No       |
| `volunteer`          | Array  | Volunteering experience.                | No       |
| `languages`          | Array  | Languages spoken.                       | No       |
| `interests`          | Array  | Hobbies and interests.                  | No       |
| `references`         | Array  | Professional references.                | No       |
| `createdAt`          | Date   | Record creation timestamp.              | Auto     |
| `updatedAt`          | Date   | Last update timestamp.                  | Auto     |

## Field Details

### `profileInformation` (Object)
*Mapped from `basics` in legacy JSON.*

| Field      | Type   | Description                         |
| ---------- | ------ | ----------------------------------- |
| `name`     | String | Full name.                          |
| `label`    | String | Job title or professional label.    |
| `image`    | String | URL or path to profile picture.     |
| `email`    | String | Email address.                      |
| `phone`    | String | Phone number.                       |
| `resumeUrl`| String | URL or path to uploaded Resume PDF. |
| `cvUrl`    | String | URL or path to uploaded CV PDF.     |
| `summary`  | String | A short bio or summary of yourself. |
| `location` | Object | Location details (see below).       |
| `profiles` | Array  | Social media profiles (see below).  |

#### `profileInformation.location` (Object)

| Field         | Type   | Description                  |
| ------------- | ------ | ---------------------------- |
| `address`     | String | Street address.              |
| `postalCode`  | String | Postal code.                 |
| `city`        | String | City name.                   |
| `countryCode` | String | Country code (e.g., IN, US). |
| `region`      | String | Region or state.             |

#### `profileInformation.profiles` (Item Object)

| Field      | Type   | Description                                   |
| ---------- | ------ | --------------------------------------------- |
| `network`  | String | Social network name (e.g., LinkedIn, GitHub). |
| `username` | String | Username on the network.                      |
| `url`      | String | URL to the profile.                           |

### `work` (Item Object)

| Field        | Type          | Description                                 |
| ------------ | ------------- | ------------------------------------------- |
| `name`       | String        | Company or organization name.               |
| `position`   | String        | Job title.                                  |
| `url`        | String        | URL of the company.                         |
| `startDate`  | String        | Start date (YYYY-MM-DD).                    |
| `endDate`    | String        | End date (YYYY-MM-DD) or empty for current. |
| `summary`    | String        | Brief summary of the role.                  |
| `highlights` | Array<String> | List of accomplishments/responsibilities.   |
| `location`   | String        | Location of the company.                    |

### `education` (Item Object)

| Field         | Type          | Description                           |
| ------------- | ------------- | ------------------------------------- |
| `institution` | String        | School or university name.            |
| `url`         | String        | URL of the institution.               |
| `area`        | String        | Area of study or major.               |
| `studyType`   | String        | Degree type (e.g., Bachelor, Master). |
| `startDate`   | String        | Start date (YYYY-MM-DD).              |
| `endDate`     | String        | End date (YYYY-MM-DD).                |
| `score`       | String        | GPA or grade.                         |
| `courses`     | Array<String> | List of notable courses.              |

### `skills` (Item Object)

| Field         | Type          | Description                                                |
| ------------- | ------------- | ---------------------------------------------------------- |
| `name`        | String        | Name of the skill (e.g., Web Development).                 |
| `level`       | String        | Proficiency level (e.g., Master, Beginner).                |
| `keywords`    | Array<String> | List of related keywords/technologies (e.g., React, HTML). |
| `description` | String        | Description of experience with the skill.                  |

### `projects` (Item Object)

| Field         | Type          | Description                                   |
| ------------- | ------------- | --------------------------------------------- |
| `name`        | String        | Project name.                                 |
| `description` | String        | Brief description of the project.             |
| `highlights`  | Array<String> | List of features or achievements.             |
| `keywords`    | Array<String> | Technologies used.                            |
| `startDate`   | String        | Start date.                                   |
| `endDate`     | String        | End date.                                     |
| `url`         | String        | Link to the live project.                     |
| `github`      | String        | Link to source code.                          |
| `roles`       | Array<String> | Roles performed (e.g., Team Lead, Developer). |
| `type`        | String        | Type of project (e.g., Mobile App, Website).  |
| `images`      | Array<String> | URLs to project screenshots.                  |

### `awards` (Item Object)

| Field     | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| `title`   | String | Title of the award.               |
| `date`    | String | Date received.                    |
| `awarder` | String | Organization that gave the award. |
| `summary` | String | Description of the award.         |

### `certificates` (Item Object)

| Field    | Type   | Description                |
| -------- | ------ | -------------------------- |
| `name`   | String | Name of the certification. |
| `date`   | String | Date issued.               |
| `issuer` | String | Issuing organization.      |
| `url`    | String | Link to certificate.       |

### `publications` (Item Object)

| Field         | Type   | Description           |
| ------------- | ------ | --------------------- |
| `name`        | String | Title of publication. |
| `publisher`   | String | Publisher name.       |
| `releaseDate` | String | Publication date.     |
| `url`         | String | Link to publication.  |
| `summary`     | String | Abstract or summary.  |

### `languages` (Item Object)

| Field      | Type   | Description    |
| ---------- | ------ | -------------- |
| `language` | String | Language name. |
| `fluency`  | String | Fluency level. |

### `volunteer` (Item Object)

| Field          | Type          | Description            |
| -------------- | ------------- | ---------------------- |
| `organization` | String        | Organization name.     |
| `position`     | String        | Role/Title.            |
| `url`          | String        | Organization URL.      |
| `startDate`    | String        | Start date.            |
| `endDate`      | String        | End date.              |
| `summary`      | String        | Summary of activities. |
| `highlights`   | Array<String> | List of achievements.  |

### `interests` (Item Object)

| Field      | Type          | Description                       |
| ---------- | ------------- | --------------------------------- |
| `name`     | String        | Name of interest.                 |
| `keywords` | Array<String> | Keywords related to the interest. |

### `references` (Item Object)

| Field       | Type   | Description               |
| ----------- | ------ | ------------------------- |
| `name`      | String | Name of reference.        |
| `reference` | String | The reference text/quote. |
