ember-element-query
==============================================================================

This Ember addon lets you apply styles to elements conditionally based on their own width, instead of using media queries based on window width.

It lets you implement reusable responsive components — with encapsulated styles, decoupled from their parent context. Such components will realign their content depending on how much space is available to them.

For example, if you put a responsive component into a tight sidebar, it will align its content vertically. When the sidebar expands, the component will realign horizontally in order to efficiently use available space.

- [ember-element-query](#ember-element-query)
  - [Roadmap](#roadmap)
  - [Rationale](#rationale)
  - [Concept of sizes](#concept-of-sizes)
  - [How ember-element-query works](#how-ember-element-query-works)
    - [Using attributes in CSS](#using-attributes-in-css)
    - [Edge cases](#edge-cases)
    - [⚠ Use in compound selectors only!](#-use-in-compound-selectors-only)
  - [Installation](#installation)
  - [Usage](#usage)
    - [As a modifier](#as-a-modifier)
    - [As a component](#as-a-component)
  - [Advanced usage](#advanced-usage)
    - [onResize callback](#onresize-callback)
    - [Custom sizes](#custom-sizes)
    - [Using height instead of width](#using-height-instead-of-width)
    - [Customizing attribute prefix](#customizing-attribute-prefix)
    - [Using multiple modifiers on the same element](#using-multiple-modifiers-on-the-same-element)
    - [Using both width and height on the Element Query component](#using-both-width-and-height-on-the-element-query-component)
  - [Browser support](#browser-support)
  - [Alternatives](#alternatives)
    - [Comparison](#comparison)
      - [Defining custom rules rules, using template and CSS transformations](#defining-custom-rules-rules-using-template-and-css-transformations)
      - [Using default rule definitions](#using-default-rule-definitions)
      - [Customizing element tag while doing template transformations](#customizing-element-tag-while-doing-template-transformations)
      - [Customizing element tag while doing pure CSS transformations](#customizing-element-tag-while-doing-pure-css-transformations)
      - [Using directly on images and other void elements](#using-directly-on-images-and-other-void-elements)
      - [Using both width and height in a rule for template transformation](#using-both-width-and-height-in-a-rule-for-template-transformation)
  - [Contributing](#contributing)
    - [Tools](#tools)
    - [Installation](#installation-1)
    - [Linting](#linting)
    - [Running tests](#running-tests)
    - [Running the dummy application](#running-the-dummy-application)
  - [License](#license)
  - [Credit](#credit)



Roadmap
------------------------------------------------------------------------------

This addon is in active development.

* [ ] `{{element-query}}` modifier
  * [x] Exists
  * [x] Sets up a `ResizeObserver`
  * [x] Calls the `onResize` callback with params
  * [x] Applies attributes to elements
  * [x] Accepts `sizes`
  * [x] Accepts `prefix`
  * [x] Accepts `dimension`
  * [ ] Updates on arugments change
* [ ] `<ElementQuery>` component
  * [ ] Exists
  * [ ] Applies attributes to itself
  * [ ] Yields block params
  * [ ] Accepts `sizes`
  * [ ] Accepts `prefix`
  * [ ] Accepts `dimension`
* [ ] Expose types
* [ ] CI
* [ ] npm package
* [ ] Documentation
  * [x] Concept
  * [x] Feature description
  * [x] Usage
  * [x] Browser support
  * [x] Comparison with alternatives
  * [ ] TypeDoc API documentation
    * [ ] Document
    * [ ] Set up auto deployment
* [ ] Demo app


Rationale
------------------------------------------------------------------------------

CSS media queries have a few disadvantages:

* They account for scrollbar width. On OSes with a scrollbar such as Windows and Linux, available document width is some 15px smaller than the one detected by a media query. Resulting styles are slightly inconsistent across OSes.
* They are designed for creating responsive layouts, whereas making responsive *components* is unreasonably hard:
  * If your responsive component appears in different contexts, you have to define media queries separately for each context and make sure they don't overlap.
  * If you want to make your responsive component reusable, you can't apply responsive styles directly to it because you don't know all the contexts it might be used in. Instead, you have to offer the styles as preprocessor mixins or CSS snippets, for the consuming app developer to apply them by hand in every context.
  * Responsive components put into dynamic contexts (such as collapsible sidebars, grids, other responsive components, etc) require *lots* of media queries, which involve unreasonably complicated math. Check out [the demo](https://lolmaus.github.io/ember-element-query/).

All those problems wouldn't exist if we were able to apply styles conditionally based on element's own width:

```css
/* Hypothetical sample. I wish these were possible, but alas! */

/* When .my-menu is <= 499px, apply margin-bottom to .my-menu--item */
.my-menu:max-width(499px) .my-menu--item {
  margin-bottom: 10px;
}

/* When .my-menu is >= 500px, apply flex to it */
.my-menu:min-width(500px) {
  display: flex;
}

/* When .my-menu is >= 500px, apply margin-right to .my-menu--item */
.my-menu:min-width(500px) .my-menu--item {
  margin-right: 10px;
}
```

Unfortunately, CSS is not aware of element's current width, so pseudoselectors like `:min-width(500px)` are impossible... unless you use a tool like `ember-element-query`.



Concept of sizes
------------------------------------------------------------------------------

`ember-element-query` operates with *sizes*. "Sizes" are like T-shirt sizes, except they indicate element width.

The default sizes scale is:

```
    Breakpoints:  0       200px     400px     600px     800px     1000px    1200px    1400px  
                  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────>
    Sizes:        ·   xxs   ·    xs   ·    s    ·    m    ·    l    ·    xl   ·   xxl   ·   xxxl   
```

The left limit of each size range is inclusive, the right limit is non-inclusive.

For example, an element is considered to be of size `m` when its width is `>= 600px` and `< 800px`.

Here's an explicit sizes chart:

```
    Breakpoints:  0       200px     400px     600px     800px     1000px    1200px    1400px  
                  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────>
    Sizes:        ·   xxs   ·    xs   ·    s    ·    m    ·    l    ·    xl   ·   xxl   ·   xxxl   
                  ·         ·         ·         ·         ·         ·         ·         ·
        xxs       │         ·         ·         ·         ·         ·         ·         ·
        0—199     ├────────┤·         ·         ·         ·         ·         ·         ·
                  ·         ·         ·         ·         ·         ·         ·         ·
        xs        ├─────────┤         ·         ·         ·         ·         ·         ·
        200—399   ├──────────────────┤·         ·         ·         ·         ·         ·
                  ·         ·         ·         ·         ·         ·         ·         ·
        s         ├───────────────────┤         ·         ·         ·         ·         ·
        400—599   ├────────────────────────────┤·         ·         ·         ·         ·
                  ·         ·         ·         ·         ·         ·         ·         ·
        m         ├─────────────────────────────┤         ·         ·         ·         ·
        600—799   ├──────────────────────────────────────┤·         ·         ·         ·
                  ·         ·         ·         ·         ·         ·         ·         ·
        l         ├───────────────────────────────────────┤         ·         ·         ·
        800—999   ├────────────────────────────────────────────────┤·         ·         ·
                  ·         ·         ·         ·         ·         ·         ·         ·
        xl        ├─────────────────────────────────────────────────┤         ·         ·
        1000—1199 ├──────────────────────────────────────────────────────────┤·         ·
                  ·         ·         ·         ·         ·         ·         ·         ·
        xxl       ├───────────────────────────────────────────────────────────┤         ·
        1200—1399 ├────────────────────────────────────────────────────────────────────┤·
                  ·         ·         ·         ·         ·         ·         ·         ·
        xxxl      ├─────────────────────────────────────────────────────────────────────┤
        1400+     ├──────────────────────────────────────────────────────────────────────────>
```



How ember-element-query works
------------------------------------------------------------------------------

`ember-element-query` applies HTML attributes to an element indicating its current size.

There are three types of attributes, all of them are applied at once:

* `at-<size>` is applied with elements current size.
  
    For example, an element with width of `764px` will receive attribute `at-m`.

* `from-<size>` are applied with element's current size and all smaller sizes.
  
    For example, an element with width of `764px` will receive attributes `from-xxs`, `from-xs`, `from-s` and `from-m`.

* `to-<size>` are applied with element's current size and all larger sizes.
  
    For example, an element with width of `764px` will receive attributes `to-m`, `to-l`, `to-xxl` and `to-xxxl`.



### Using attributes in CSS

They can be used in CSS like this:

```css
.foo[at-xxs] {
  /* These styles when be applied when the element has exactly the size of `xxs`, namely 0—199 px. */
}

.foo[from-xs] {
  /* These styles when be applied when the element has the size of `xxs` or larger, namely 200+ px. */
}

.foo[to-xl] {
  /* These styles when be applied when the element has the size of `xl` or smaller, namely 0—1199 px. */
}

.foo[from-s][to-l] {
  /* These styles when be applied when the element has the size between `s` and `l` inclusively, namely 400—999 px. */
}
```



### Edge cases

Note that some attribute usages don't make much sense:

* The smallest `from-` and the largest `to-` attribute are applied at all times, thus `.foo[from-xxs]` and `.foo[to-xxxl]` selectors are both equivalent to simply `.foo`.
* `.foo[to-xxs]` is equivalent to `.foo[at-xxs]`, and `.foo[from-xxxl]` is equivalent to `.foo[at-xxxl]`.
* `.foo[from-m][to-m]` is equivalent to `.foo[at-m]`.



### ⚠ Use in compound selectors only!

Attribute selectors in CSS should **only** be used in conjunction with semantic selectors.

The following usage will mess up you website/app:

```css
/* Never do this! */
[at-m] {
  float: left;
}

/* Still quite bad */
aside[at-m] {
  float: left;
}

/* OK */
.my-side-block[at-m] {
  float: left;
}
```



Installation
------------------------------------------------------------------------------

Use `ember-cli` to install the addon as usual:

    ember i ember-element-query

This addon does not do anything on install, so it can alternatively be installed with npm:

    npm i -D ember-element-query

...or Yarn:

    yarn add -D ember-element query



Usage
------------------------------------------------------------------------------

### As a modifier

Using the modifier is preferred if you only do CSS transformations.

Simply apply the `{{element-query}}` modifier to any element or angle bracket component like this:

```html
<img {{element-query}}>
```

As a result, element query attributes will be applied to the element. The result could look like this:

```html
<img at-m from-xxs from-xs from-s from-m to-m to-l to-xl to-xxl to-xxxl>
```



### As a component

The component is useful when you need to do template transformations.

Use it like this:

```html
<ElementQuery as |at from to|>
  <at.m>
    {{! This will only be rendered when the `<ElementQuery>` component is of size `m`. }}
  </at.m>

  <from.m>
    {{! This will only be rendered when the `<ElementQuery>` component is of size `m` or larger. }}
  </from.m>

  <to.m>
    {{! This will only be rendered when the `<ElementQuery>` component is of size `m` or smaller. }}
  </to.m>

  <from.s><to.l>
    {{! This will only be rendered when the `<ElementQuery>` component is of size `s`, `m` or `l`. }}
  </to.l></from.s>
</ElementQuery>
```



Advanced usage
------------------------------------------------------------------------------

### onResize callback

You can pass a callback to the `onResize` argument and it will be called whenever the element resizes:

```js
@action
reportResize(data) {
  data.element // => current element
  data.width   // => current element's width in px (number)
  data.height  // => current element's height in px (number)
  data.ratio   // => current element's aspect ratio (width/height, number)
  data.size    // => current element's size (string)
}
```

```html
<img {{element-query onResize=this.reportResize}}>
```

```html
<ElementQuery @onResize={{this.reportResize}}></ElementQuery>
```



### Custom sizes

Your tailored visual designs might require component switching layouts at breakpoints different from this addon's defaults.

You can override them with the `sizes` argument. It receives a plain object where keys are breakpoint names and arguments are numbers representing width.

⚠ One of the numbers **must** be 0, otherwise the addon will crash your app.

```html
<img
  {{element-query
    sizes=(hash
      small=0
      medium=350
      large=700
    )
  }}
>
```

```html
<ElementQuery
  @sizes={{hash
    small=0
    medium=350
    large=700
  }}
>
</ElementQuery>
```

The above example defines sizes like this:

* `small`: 0—349 px,
* `medium`: 350—699 px,
* `large`: 700+ px.

When the element has the width of `421px`, it will receive attributes `at-medium`, `from-medium`, `to-medium`, `from-small` and `to-large`.



### Using height instead of width

Use the `dimension="height"` argument to make attributes get applied based on element height:

```html
<img {{element-query dimension="height"}}>
```

```html
<ElementQuery @dimension="height"></ElementQuery>
```



### Customizing attribute prefix

Use the `prefix` argument to adjust attribute prefix:

```html
<img {{element-query prefix="data-foo-"}}>
```

```html
<ElementQuery @prefix="data-foo-"></ElementQuery>
```

This will result in attributes like `data-foo-at-xl`, `data-foo-from-m`, etc.



### Using multiple modifiers on the same element

You can use both width and height element queries on the same element like this:

```html
<img
  class="foo"
  {{element-query dimension="width"  prefix="width-"}}
  {{element-query dimension="height" prefix="height-"}}
>
```

This lets you apply CSS like this:

```
.foo[width-at-m][height-from-m] {}
```

Another use case is when you already have many styles written for default attributes, and then your designer tells you to apply a new style based on non-default breakpoints. Multiple modifiers lets you do this without rewriting existing styles:

```html
<img
  {{element-query}}
  {{element-query prefix="new-" sizes=(hash small=0 large=768)}}
>
```

⚠ Never apply two or more modifiers with the same prefix to the same element. The `{{element-query}}` modifier adds and removes attributes aggressively and will interfere with other modifiers/libraries manipulating same attributes.



### Using both width and height on the Element Query component

You can pass your height sizes into `@sizesHeight`. Make sure that height size names are different from [width sizes](#concept-of-sizes)!

```html
<ElementQuery
  @sizes=(hash smallWidth=0 mediumWidth=350 largeWidth=700)
  @heightSizes=(hash smallHeight=0 mediumHeight=200 largeHeight=400)
  as |at from to|
>
  <to.smallWidth><from.largeHeight>
    I am thin and tall.
  </from.largeHeight></to.smallWidth>
</ElementQuery>
```

You can also pass `true` to `@sizesHeight`, which will enable default sizes. They are the same as [width sizes](#concept-of-sizes) but postfixed with `Height`: `xxsHeight`, `xlHeight`, etc.

```html
<ElementQuery @heightRules=true as |at from to|>
  <to.s><from.lHeight>
    I am thin and tall.
  </from.lHeight></to.s>
</ElementQuery>
```



Browser support
------------------------------------------------------------------------------

`ember-element-query` is based on [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) which is **not supported by IE**.

As of 2020-06, the following major browsers are supported:

* Chrome: 64+ (since 2018-01-23),
* Firefox: 69+ (since 2019-09-02, desktop only),
* Safari: 13.1+ desktop, 13.4+ iOS (since 2020-03-24).

See [caniuse.com](https://caniuse.com/#feat=resizeobserver) for detailed stats.

⚠ Note that old iOS devices do not have `ResizeObserver`, so you might want to use a polyfill. iOS Safari is the new IE. 😬



Alternatives
------------------------------------------------------------------------------

There are a few other Ember addons implementing element queries, such as:

* https://github.com/chadian/ember-fill-up/
* https://github.com/ijlee2/ember-container-query

`ember-element-query` was implemented to offer a simpler API at the cost of being opinionated.

Other addons are full-fledged element query addons that aren't as much opinionated. Their approach is defining rules on element query components. For example, if you want your component to respond to `max-width: 349px`, `min-width: 350px`, `min-width: 350px and max-width: 699px` and `min-width: 700px` — you will need to define four rules on the component. An unexpected challenge is to come up with meaningful names for each range.

Every time you need another rule, you need to add it on the component before you're able to use it in CSS.

With `ember-element-query`, you only need to define *breakpoints*. The example above uses only two breakpoints: `350px` and `700px` — and all combinations of rules become available automatically via attributes.

💡 **`ember-fill-up` and `ember-container-query` are tailored for template transformations, e. g. via `{{#if}}`. `ember-element-query` is tailored for pure CSS transformations, accoridng to the Responsive Web Design paradigm.** That said, each addon covers every case. Well, almost every case:



### Comparison

#### Defining custom rules rules, using template and CSS transformations

Given breakpoints 350, 700 and 1050:

* `ember-fill-up`:

    ```html
    <FillUp
      class="my-component"
      @breakpoints={{hash
        small=(fill-up-lt 350)
        medium=(fill-up-between 350 700)
        large=(fill-up-between 700 1050)
        extraLarge=(fill-up-gte 1050)

        mediumAndBigger=(fill-up-gte 350)
        largeAndBigger=(fill-up-gte 700)
        mediumAndSmaller=(fill-up-lt 700)
        largeAndSmaller=(fill-up-lt 1050)
        
        mediumToLarge=(fill-up-between 350 1050)
      }}
      as |F|
    >
      {{#if F.breakpoints.small}}...{{/if}}
      {{#if F.breakpoints.medium}}...{{/if}}
      {{#if F.breakpoints.large}}...{{/if}}
      {{#if F.breakpoints.extraLarge}}...{{/if}}

      {{#if F.breakpoints.mediumAndBigger}}...{{/if}}
      {{#if F.breakpoints.largeAndBigger}}...{{/if}}
      {{#if F.breakpoints.mediumAndSmaller}}...{{/if}}
      {{#if F.breakpoints.largeAndSmaller}}...{{/if}}

      {{#if F.breakpoints.mediumToLarge}}...{{/if}}
    </FillUp>
    ```

    ```css
    .my-component[fill-up-small] {}
    .my-component[fill-up-medium] {}
    .my-component[fill-up-large] {}
    .my-component[fill-up-extraLarge] {}

    .my-component[fill-up-mediumToLarge] {}
    .my-component[fill-up-largeAndBigger] {}
    .my-component[fill-up-mediumAndSmaller] {}
    .my-component[fill-up-largeAndSmaller] {}

    .my-component[fill-up-mediumToLarge] {}
    ```

    👆 Note how you need to repeat same breakpoints several times in rule definitions. In order to avoid multiple sources of truth, you could wrap component invocation with `{{let}}`, but that increases the boilerplate.

* `ember-container-query`:

    ```html
    <ContainerQuery
      class="my-component"
      @features={{hash
        small=(cq-width max=349)
        medium=(cq-width min=350 max=699)
        large=(cq-width min=700 max=1049)
        extraLarge=(cq-width min=1050)

        mediumAndBigger=(cq-width min=350)
        largeAndBigger=(cq-width min=700)
        mediumAndSmaller=(cq-width max=699)
        largeAndSmaller=(cq-width max=1049)
        
        mediumToLarge=(cq-width min=350 max=1049)
      }}
      as |CQ|
    >
      {{#if CQ.features.small}}...{{/if}}
      {{#if CQ.features.medium}}...{{/if}}
      {{#if CQ.features.large}}...{{/if}}
      {{#if CQ.features.extraLarge}}...{{/if}}
      {{#if CQ.features.mediumAndBigger}}...{{/if}}
      {{#if CQ.features.largeAndBigger}}...{{/if}}
      {{#if CQ.features.mediumAndSmaller}}...{{/if}}
      {{#if CQ.features.largeAndSmaller}}...{{/if}}
      {{#if CQ.features.mediumToLarge}}...{{/if}}
    </ContainerQuery>
    ```

    ```css
    .my-component[data-container-query-small] {}
    .my-component[data-container-query-medium] {}
    .my-component[data-container-query-large] {}
    .my-component[data-container-query-extraLarge] {}
    .my-component[data-container-query-mediumToLarge] {}
    .my-component[data-container-query-largeAndBigger] {}
    .my-component[data-container-query-mediumAndSmaller] {}
    .my-component[data-container-query-largeAndSmaller] {}
    .my-component[data-container-query-mediumToLarge] {}
    ```

    👆 Note how you need to manually account for ±1 error in rule definitions.

* `ember-element-query`:

    ```html
    <ElementQuery
      class="my-component"
      @sizes=(hash small=0 medium=350 large=700 extraLarge=1050)
      as |at from to|
    >
      <at.small>...</at.small>
      <at.medium>...</at.medium>
      <at.large>...</at.large>
      <at.extraLarge>...</at.extraLarge>

      <from.medium>...</from.medium>
      <from.large>...</from.large>
      <to.medium>...</to.medium>
      <to.large>...</to.large>

      <from.medium><to.large>...</to.large></from.medium>
    </ElementQuery>
    ```

    ```css
    .my-component[at-small] {}
    .my-component[at-medium] {}
    .my-component[at-large] {}
    .my-component[at-extraLarge] {}

    .my-component[from-medium] {}
    .my-component[from-large] {}
    .my-component[to-medium] {}
    .my-component[to-large] {}

    .my-component[from-medium][to-large] {}
    ```

  👆 Note how much shorter rule definitions are. 



#### Using default rule definitions

* `ember-fill-up`:

    Does not provide any defaults.

* `ember-container-query`:

    Does not provide any defaults.

* `ember-element-query`:

    Provides [reasonable defaults(#concept-of-sizes).
    
    **Those defaults can be used as a common design language, and all components in your app can be using them, reducing the boilerplate to:**

    ```html
    <ElementQuery></ElementQuery>
    ```

    or

    ```html
    <div {{element-query}}></div>
    ```



#### Customizing element tag while doing template transformations

* `ember-fill-up`:

    Impossible until [RFC 389](https://github.com/emberjs/rfcs/blob/master/text/0389-dynamic-tag-names.md) is implemented ([tracking](https://github.com/emberjs/rfc-tracking/issues/42)).

* `ember-container-query`:

    Impossible until [RFC 389](https://github.com/emberjs/rfcs/blob/master/text/0389-dynamic-tag-names.md) is implemented ([tracking](https://github.com/emberjs/rfc-tracking/issues/42)).

* `ember-element-query`:

    Impossible until [RFC 389](https://github.com/emberjs/rfcs/blob/master/text/0389-dynamic-tag-names.md) is implemented ([tracking](https://github.com/emberjs/rfc-tracking/issues/42)).



#### Customizing element tag while doing pure CSS transformations

* `ember-fill-up`:

    Impossible until [RFC 389](https://github.com/emberjs/rfcs/blob/master/text/0389-dynamic-tag-names.md) is implemented ([tracking](https://github.com/emberjs/rfc-tracking/issues/42)).

* `ember-container-query`:

    Impossible until [RFC 389](https://github.com/emberjs/rfcs/blob/master/text/0389-dynamic-tag-names.md) is implemented ([tracking](https://github.com/emberjs/rfc-tracking/issues/42)).

* `ember-element-query`:

    ```html
    <article {{element-query}}>
    </article>
    ```



#### Using directly on images and other void elements

* `ember-fill-up`:

    Impossible until [RFC 389](https://github.com/emberjs/rfcs/blob/master/text/0389-dynamic-tag-names.md) is implemented ([tracking](https://github.com/emberjs/rfc-tracking/issues/42)).

    Workaround with two wrapper elements:

    ```html
    <FillUp class="wrapper1" breakpoints=this.rules>
      <div class=wrapper2>
        <img class="image" src alt>
      </div>
    </FillUp>
    ```

    ```css
    .wrapper1[fill-up-small]  {
      opacity: 0.5;
    }
    .wrapper1[fill-up-large]  {
      transform: rotate(5);
    }

    .wrapper2 {
      position: relative;
      padding-top: 56.25%; /* The ratio of the image must be known. Alternatively, the image can be cropped with `object-fit: cover` to arbitrary aspect ratio.*/
    }

    .wrapper2 .image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    ```

* `ember-container-query`:

    Impossible until [RFC 389](https://github.com/emberjs/rfcs/blob/master/text/0389-dynamic-tag-names.md) is implemented ([tracking](https://github.com/emberjs/rfc-tracking/issues/42)).
    
    Workaround with two wrapper elements: same as in `ember-fill-up`.


* `ember-element-query`:

    ```html
    <img {{element-query}} src alt class="image">
    ```

    ```css
    .image {
      width: 100%;
      height: auto;
    }

    .image[at-small]  {
      opacity: 0.5;
    }

    .image[from-large]  {
      transform: rotate(5);
    }
    ```



#### Using both width and height in a rule for template transformation

* `ember-fill-up`:

    ```html
    <FillUp
      class="my-component"
      @breakpoints={{hash
        smallWidth=(fill-up-lt 350)
        mediumWidth=(fill-up-between 350 700)
        largeWidth=(fill-up-gte 700)

        smallHeight=(fill-up-lt 199 dimension="height")
        mediumHeight=(fill-up-between 200 399 dimension="height")
        largeHeight=(fill-up-gte 400 dimension="height")
      }}
      as |F|
    >
      {{#if (and F.breakpoints.smallWidth F.breakpoints.largeHeight)}}
        I am thin and tall.
      {{/if}}
    </FillUp>
    ```

* `ember-container-query`:

    ```html
    <ContainerQuery
      class="my-component"
      @features={{hash
        smallWidth=(cq-width max=349)
        mediumWidth=(cq-width min=350 max=699)
        largeWidth=(cq-width min=700)

        smallHeight=(cq-height max=199)
        mediumHeight=(cq-height min=200 max=399)
        largeHeight=(cq-height min=400)
      }}
      as |CQ|
    >
      {{#if (and CQ.features.smallWidth CQ.features.largeHeight)}}
        I am thin and tall.
      {{/if}}
    </ContainerQuery>
    ```

* `ember-element-query`:

    ```html
    <ElementQuery
      @sizes=(hash smallWidth=0 mediumWidth=350 largeWidth=700)
      @heightSizes=(hash smallHeight=0 mediumHeight=200 largeHeight=400)
      as |at from to|
    >
      <at.smallWidth><at.largeHeight>
        I am thin and tall.
      </at.largeHeight></to.smallWidth>
    </ElementQuery>
    ```

    When usign default sizes, this gets even shorter:

    ```html
    <ElementQuery @heightRules=true as |at from to|>
      <at.s><at.lHeight>
        I am thin and tall.
      </at.lHeight></at.s>
    </ElementQuery>
    ```



Contributing
------------------------------------------------------------------------------

### Tools

Use [Volta](https://volta.sh/) and [Yarn](https://yarnpkg.com/).



### Installation

* `git clone <repository-url>`
* `cd ember-element-query`
* `yarn`



### Linting

* `yarn lint:hbs` — only templates
* `yarn lint:ts` — only TypeScript compiler (tsc)
* `yarn lint:eslint` — only ESLint (including Prettier and `typescript-eslint`)
* `yarn lint` — everything



### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions



### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).



License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).



Credit
------------------------------------------------------------------------------

Initially implemented by Andrey Mikhaylov ([lolmaus](https://github.com/lolmaus)) and [contributors](https://github.com/lolmaus/ember-element-query/graphs/contributors).

Thanks to Chad Carbert ([chadian](https://github.com/chadian)) and Isaac Lee ([ijlee2](https://github.com/ijlee2)) for feedback, ideas, brainstorming and criticism.
