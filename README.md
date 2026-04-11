# Personal Academic Website

This repository contains a simple personal academic website built with static HTML, CSS, and JavaScript.

The page content is driven by [`assets/config.yaml`](/Users/alessandrosoccol/Documents/phdwebsite/assets/config.yaml). In practice, most edits happen there: you define your profile information, the sections to show, and the content inside each section.

## How It Works

The website is made of three main parts:

- [`index.html`](/Users/alessandrosoccol/Documents/phdwebsite/index.html): the page structure
- [`assets/style.css`](/Users/alessandrosoccol/Documents/phdwebsite/assets/style.css): the visual style
- [`assets/config.js`](/Users/alessandrosoccol/Documents/phdwebsite/assets/config.js): the logic that loads the YAML config and renders the page

When the page loads:

1. `index.html` loads `assets/config.js`
2. `assets/config.js` fetches `assets/config.yaml`
3. The YAML is parsed in the browser
4. The header and all sections are rendered dynamically

This means you usually do not need to edit the HTML to change content. You mainly edit the YAML file.

## Local Preview

Because the site loads `assets/config.yaml` through JavaScript, you should preview it with a local web server instead of opening `index.html` directly in the browser.

From the project root, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

To stop the server, press `Ctrl+C`.

## How To Set Up The Page

Most of the setup happens in [`assets/config.yaml`](/Users/alessandrosoccol/Documents/phdwebsite/assets/config.yaml).

### 1. Site Metadata

Use the `site` block for browser metadata:

```yaml
site:
  title: "Your Name"
  meta_description: "Short description"
  meta_author: "Your Name"
```

### 2. Header

Use the `header` block for the top part of the page:

```yaml
header:
  profile_image: "images/profile.jpeg"
  profile_alt: "Your Name"
  name_html: "Your Name"
  meta_html: "Your role<br><span class=\"sub-text\">Your institution</span>"
  body_html: "Short bio paragraph."
  keywords:
    - "Research Area 1"
    - "Research Area 2"
  links:
    - label: "Email"
      href: "mailto:you@example.com"
    - label: "GitHub"
      href: "https://github.com/yourname"
      target: "_blank"
```

Notes:

- `name_html`, `meta_html`, and `body_html` accept HTML
- `keywords` renders the centered tags under the bio
- `links` renders the links near the profile header

### 3. Section Order And Titles

Use the `sections` block to define:

- which sections appear
- the order in which they appear
- the title shown for each section

Example:

```yaml
sections:
  publications: "Publications"
  conference_tutorials: "Conference Tutorials"
  program_committee: "Program Committee Membership"
  experience: "Experience"
  education: "Education"
```

Important:

- each key under `sections` must match a real top-level section below
- if a section is listed here but the corresponding content block does not exist, it will not be rendered

## Supported Section Types

The current JavaScript renderer supports the following section names.

### `publications`

Example:

```yaml
publications:
  scholar_link:
    label: "See full list on Google Scholar"
    href: "https://scholar.google.com/..."
  papers:
    - title: "Paper title"
      url: "https://example.com"
      authors: "Author 1, Author 2, and <strong>Your Name</strong>"
      venue: "Conference 2026"
      links:
        - label: "[PDF]"
          url: "https://example.com/pdf"
```

### `conference_tutorials`

This uses the same card-style layout as publications.

```yaml
conference_tutorials:
  items:
    - title: "Tutorial title"
      url: "https://example.com"
      authors: "Author list"
      venue: "Conference 2026"
      links:
        - label: "[Tutorial page]"
          url: "https://example.com/tutorial"
```

### `program_committee`

This supports a simple list.

```yaml
program_committee:
  items:
    - text: "Conference Name 2026"
    - text: "Workshop Name 2025"
```

You can also use:

```yaml
program_committee:
  - "Conference Name 2026"
  - "Workshop Name 2025"
```

### `experience`

```yaml
experience:
  - role: "Research Fellow"
    place: "University Name"
    place_url: "https://example.com"
    logo: "images/logo.png"
    logo_alt: "University Name"
    date: "08/2024 - Present"
```

### `education`

This uses the same timeline-style layout as `experience`.

```yaml
education:
  - role: "Master's Degree in ..."
    place: "University Name"
    logo: "images/logo.png"
    logo_alt: "University Name"
    date: "2024 - Present"
```

### `news`

```yaml
news:
  - date: "Feb 2026"
    html: "Started a new position."
```

## Adding A New Section

To add a new section:

1. Add it to the `sections` block
2. Add a top-level content block with the same name
3. If the section uses a brand new data structure, update [`assets/config.js`](/Users/alessandrosoccol/Documents/phdwebsite/assets/config.js) to render it

Example:

```yaml
sections:
  awards: "Awards"
```

Then:

```yaml
awards:
  items:
    - text: "Best Paper Award, Conference 2026"
```

If `awards` is not supported by the JS renderer yet, you will need to add a renderer for it in `assets/config.js`.

## Assets

Typical asset locations:

- profile image: `images/`
- logos: `images/`
- PDF CV: `pdfs/`

Keep file paths relative to the project root, for example:

```yaml
profile_image: "images/profile.jpeg"
```

## Typical Editing Workflow

1. Start the local server:

```bash
python -m http.server 8000
```

2. Open `http://localhost:8000`
3. Edit [`assets/config.yaml`](/Users/alessandrosoccol/Documents/phdwebsite/assets/config.yaml)
4. Refresh the browser
5. If needed, adjust layout styles in [`assets/style.css`](/Users/alessandrosoccol/Documents/phdwebsite/assets/style.css)

## Troubleshooting

If the page does not update correctly:

- make sure you are using `python -m http.server` and not opening the HTML file directly
- check that the YAML indentation is valid
- verify that each section name in `sections` matches a real top-level block
- open the browser developer console and look for JavaScript or YAML parsing errors

If a section does not appear:

- confirm it is listed under `sections`
- confirm a matching top-level section exists with the same name
- confirm that section type is supported in [`assets/config.js`](/Users/alessandrosoccol/Documents/phdwebsite/assets/config.js)

If you have any problem, kindly ask Codex/Claude to solve it.

## Credits

This project was originally inspired by:

- https://github.com/arvindh75/arvindh75.github.io
- https://github.com/ameya98/ameya98.github.io
