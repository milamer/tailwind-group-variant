<div align="center">
<h1>tailwind-group-variant</h1>

<p>Group multiple tailwind classes into a single variant</p>
</div>

---

<!-- **[Demo](https://codesandbox.io/s/wyk856yo48)** -->

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]
[![All Contributors][all-contributors-badge]](#contributors-)
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]
[![Examples][examples-badge]][examples]
<!-- prettier-ignore-end -->

## The problem

1.  You use TailwindCss and have very long class names
2.  You want shorter and grouped variants
3.  You want a way to configure the syntax

## This solution

A custom transformer that gives tailwind a changed version of the content of
your files. The syntax can be changed by providing a variant character, a group
open character and a group closing character. You can use the transformer in
your tailwind.config.js.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
- [Advanced options](#advanced-options)
  - [variantChar: `[string]`](#variantchar-string)
  - [separatorChar: `[string]`](#separatorchar-string)
  - [expandOpenChar: `[string]` and expandCloseChar: `[string]`](#expandopenchar-string-and-expandclosechar-string)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
  - [💡 Feature Requests](#-feature-requests)
- [Contributors ✨](#contributors-)
- [LICENSE](#license)
- [Special Thanks](#special-thanks)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install tailwind-group-variant
```

## Usage

Update your tailwind config in order to transform your file's content before
tailwind extracts their classes.

```javascript
// tailwind.config.js
const createTransformer = require('tailwind-group-variant')
module.exports = {
  content: {
    files: ['./app/**/*.{ts,tsx,jsx,js,mdx}'],
    transform: createTransformer(),
  },
  ...
}
```

Then create a transformer function and use it in your className to expand you
classes on the div.

```tsx
// hero.jsx
import createTransformer from 'tailwind-group-variant'
const expandVariant = createTransformer()

export default function Hero({children}) {
  return (
    <div
      className={expandVariant(
        'relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:(max-w-2xl,w-full,pb-2) xl:pb-32',
      )}
    >
      {children}
    </div>
  )
}
```

will be transformed to:

```tsx
export default function Hero({children}) {
  return (
    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-2 xl:pb-32">
      {children}
    </div>
  )
}
```

## Advanced options

### variantChar: `[string]`

_Default: `:`_

By default it just uses the default value of tailwind. Use the same char you use
as `separator` in your `tailwind.config.js`.

Change the call to `createTransformer` in your `tailwind.config.js`.

```javascript
// tailwind.config.js
const createTransformer = require('tailwind-group-variant')
module.exports = {
  content: {
    files: ['./app/**/*.{ts,tsx,jsx,js,mdx}'],
    transform: createTransformer({ variantChar: '_' }),
  },
  ...
}
```

Change the char to separate variants in your components:

```tsx
export default function Hero({children}) {
  return (
    <div className="relative z-10 pb-8 bg-white sm_pb-16 md_pb-20 lg_(max-w-2xl,w-full,pb-2) xl_pb-32">
      {children}
    </div>
  )
}
```

will be transformed to:

```tsx
export default function Hero({children}) {
  return (
    <div className="relative z-10 pb-8 bg-white sm_pb-16 md_pb-20 lg_max-w-2xl lg_w-full lg_pb-2 xl_pb-32">
      {children}
    </div>
  )
}
```

### separatorChar: `[string]`

_Default: `,`_

By default it uses space. You can change it to other separators like ` `, `|` or
`/`.

Change the call to `createTransformer` in your `tailwind.config.js`.

```javascript
// tailwind.config.js
const createTransformer = require('tailwind-group-variant')
module.exports = {
  content: {
    files: ['./app/**/*.{ts,tsx,jsx,js,mdx}'],
    transform: createTransformer({ separatorChar: '|' }),
  },
  ...
}
```

Use the separator in you components:

```tsx
export default function Hero({children}) {
  return (
    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:(max-w-2xl|w-full|pb-2) xl:pb-32">
      {children}
    </div>
  )
}
```

will be transformed to:

```tsx
export default function Hero({children}) {
  return (
    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-2 xl:pb-32">
      {children}
    </div>
  )
}
```

### expandOpenChar: `[string]` and expandCloseChar: `[string]`

- expandOpenChar: _Default: `(`_
- expandCloseChar: _Default: `)`_

By default it uses `(` `)`, but can be change to `{` `}`.

Change the call to `createTransformer` in your `tailwind.config.js`.

```javascript
// tailwind.config.js
const createTransformer = require('tailwind-group-variant')
module.exports = {
  content: {
    files: ['./app/**/*.{ts,tsx,jsx,js,mdx}'],
    transform: createTransformer({ expandOpenChar: '{', expandCloseChar: '}' }),
  },
  ...
}
```

Change the char to separate variants in your components:

```tsx
export default function Hero({children}) {
  return (
    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:{max-w-2xl,w-full,pb-2} xl:pb-32">
      {children}
    </div>
  )
}
```

will be transformed to:

```tsx
export default function Hero({children}) {
  return (
    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-2 xl:pb-32">
      {children}
    </div>
  )
}
```

## Issues

_Looking to contribute? Look for the [Good First Issue][good-first-issue]
label._

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][requests]

## Contributors ✨

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## LICENSE

MIT

## Special Thanks

Special thanks to Kent C. Dodds and his [match-sorter][match-sorter] package
where most of the setup is from.

<!-- prettier-ignore-start -->
[npm]: https://www.npmjs.com
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/github/workflow/status/milamer/tailwind-group-variant/validate?logo=github&style=flat-square
[build]: https://github.com/milamer/tailwind-group-variant/actions?query=workflow%3Avalidate
[coverage-badge]: https://img.shields.io/codecov/c/github/milamer/tailwind-group-variant.svg?style=flat-square
[coverage]: https://codecov.io/github/milamer/tailwind-group-variant
[version-badge]: https://img.shields.io/npm/v/tailwind-group-variant.svg?style=flat-square
[package]: https://www.npmjs.com/package/tailwind-group-variant
[downloads-badge]: https://img.shields.io/npm/dm/tailwind-group-variant.svg?style=flat-square
[npmtrends]: https://www.npmtrends.com/tailwind-group-variant
[license-badge]: https://img.shields.io/npm/l/tailwind-group-variant.svg?style=flat-square
[license]: https://github.com/milamer/tailwind-group-variant/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/milamer/tailwind-group-variant/blob/master/CODE_OF_CONDUCT.md
[emojis]: https://github.com/all-contributors/all-contributors#emoji-key
[all-contributors]: https://github.com/all-contributors/all-contributors
[all-contributors-badge]: https://img.shields.io/github/all-contributors/milamer/tailwind-group-variant?color=orange&style=flat-square
[bugs]: https://github.com/milamer/tailwind-group-variant/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Acreated-desc+label%3Abug
[requests]: https://github.com/milamer/tailwind-group-variant/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement
[good-first-issue]: https://github.com/milamer/tailwind-group-variant/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement+label%3A%22good+first+issue%22
[match-sorter]: https://github.com/kentcdodds/match-sorter/blob/main/README.md
<!-- prettier-ignore-end -->
