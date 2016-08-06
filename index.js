/* jshint node: true */
'use strict';

/**
 * This Ember addon allows applying styles to elements conditionally based on
 * element's own width rather than viewport width.
 *
 * This lets you implement your HTML elements as independent components capable
 * of RWD transformations while staying decoupled from their parent context.
 *
 * Rationale
 * =========
 *
 * The Problem with Media Queries
 * ------------------------------
 *
 * Imagine you have a post preview component that has an image and a paragraph
 * of text. When the component is narrow, smaller than 200px, the text should
 * appear below the image (vertical layout). But when it's wider than that, the
 * text should appear on the side (horizontal layout):
 *
 * ![Imgur](http://i.imgur.com/Qs4A3RD.png)
 *
 * It's trivial to achieve with media queries, right? The implementation could
 * look like this:
 *
 * ```sass
 * .postPreview
 *
 *   @media only screen and (max-width: 399px)
 *     // vertical layout
 *
 *   @media only screen and (min-width: 400px)
 *     // horizontal layout
 * ```
 *
 * But you now need to put the items into a modular grid. The grid is both fluid
 * and responsive. The grid should have
 * three columns when it's smaller than 650px, four columns at < 900px and five
 * at < 1250px:
 *
 * ![Imgur](http://i.imgur.com/YMKJCXc.png)
 *
 * This is where your code gets messy. You'll end up with something like this:
 *
 * ```scss
 * .postPreview {
 *   @media only screen and
 *   (min-width: 210px) and (max-width: 299px),
 *   (min-width: 420px) and (max-width: 509px),
 *   (min-width: 630px) and (max-width: 719px),
 *   (min-width: 840px) and (max-width: 929px),
 *   //....
 *   (min-width: 1920px){
 *     // vertical layout
 *   }
 *
 *   @media only screen and
 *   (min-width: 300px) and (max-width: 419px),
 *   (min-width: 510px) and (max-width: 629px),
 *   (min-width: 720px) and (max-width: 839px),
 *   (min-width: 930px) and (max-width: 1049px),
 *   //....
 *   {
 *     // horizontal layout
 *   }
 * }
 * ```
 *
 * Now there's also a sidebar that take 274px and the user can collapse/expand.
 * When it expands, it eats some width, which may cause the grid to change
 * the number of columns.
 *
 * ![Imgur](http://i.imgur.com/SK5BSSz.png)
 *
 * Imagine defining RWD styles to the post preview component using media
 * queries. It gets really tough because **in order to decide whether to use
 * vertical or horizontal layout for certain viewport width, you have to know
 * which layout every parent component has**.
 *
 * Maintaining this table is a nightmare, especially when you need to make
 * changes.
 *
 * But that's not all there is to it! You now need to reuse this component in
 * two or more distinct applications. :trollface:
 *
 *
 * Enter Element Query
 * -------------------
 *
 * ![What if I told you you can define queries based on component's own width
 * and not viewport width](http://i.imgur.com/CSuC7xf.jpg)
 *
 * The above Sass could look like this:
 *
 * ```sass
 * .postPreview
 *   +eq-to(narrow)
 *     // vertical layout
 *
 *   +eq-from(wide)
 *     // horizontal layout
 * ```
 *
 * And you can put this component into any parent, any context and it will
 * realign based on its own width.
 *
 * You can now **create completely decoupled responsive components**.
 *
 * Of course that's not possible with just CSS/Sass. You need a pinch of JS.
 * This is where `ember-element-query` comes into play.
 *
 *
 * Installation
 * ============
 *
 *     ember install ember-element-query
 *
 *
 * Basic Usage
 * ===========
 *
 * Mix the `ember-element-query/mixin` into your component and define slices:
 *
 * ```js
 * import EEQMixin from 'ember-element-query/mixin';
 *
 * export default Ember.Component.extend(EEQMixin, {
 *   eqSlices: {
 *     0:    'xxs',
 *     200:  'xs',
 *     400:  's',
 *     600:  'm',
 *     800:  'l',
 *     1000: 'xl',
 *     1200: 'xxl',
 *     1400: 'xxxl',
 *   },
 * });
 * ```
 *
 * Slice names must be valid HTML class names, and they also should not contain
 * spaces or dashes.
 *
 * Note that these are default values for slices. If you're happy with the
 * defaults, you don't need to provide `eqSlices`.
 *
 * If you instead want to apply element queries to a component's child element,
 * you can use the `e-q` component in your component's template like this:
 *
 * ```hbs
 * <div class="foo">
 *   {{#e-q
 *     eqSlices=(hash
 *       0   = 's'
 *       500 = 'm'
 *       900 = 'l'
 *     )
 *   }}
 * </div>
 * ```
 *
 * Again, `eqSlices` is optional.
 *
 * If you use Sass, import the Sass mixins into your styles:
 *
 *     \@import 'node_modules/ember-element-query/addon/mixins';
 *
 * If you don't use Sass, see below for plain CSS usage.
 *
 * You're all set! You can apply conditional styles using default slices (see
 * below) or define your own slices.
 *
 *
 *
 * Result
 * ======
 *
 * `ember-element-query` will apply four data attributes to your component:
 *
 * ```html
 * <div
 *   data-eq-current="l"
 *   data-eq-from="xxs xs s m l"
 *   data-eq-to="l xl xxl xxxl"
 *   data-eq-between="xxs-l xxs-xl xxs-xxl xxs-xxxl xs-l xs-xl xs-xxl xs-xxxl s-l s-xl s-xxl s-xxxl m-l m-xl m-xxl m-xxxl l-l l-xl l-xxl l-xxxl"
 * >
 * ```
 *
 * The content of those attributes is dynamic, it depends on component's current
 * width and the map of breakpoints to slices from the `eqSlices` property.
 *
 * The `[attr~="value"]` CSS selector matches when an attribute contains given
 * value from a space-delimited list of values.
 *
 *
 * The Concept of Slices
 * =====================
 *
 * Imagine the breakpoints of your ~~site~~ individual component on a scale:
 *
 *      Breakpoint:   0                 400px     600px     800px       1050px
 *                    ├───────────────────┼─────────┼─────────┼───────────┼─────────>
 *
 * See those spans between breakpoints? Let's name them "slices".
 *
 * Let's give them names:
 *
 *      Breakpoint:   0                 400px     600px     800px       1050px
 *                    ├───────────────────┼─────────┼─────────┼───────────┼─────────>
 *      Slice:                 xs              s         m          l          xl
 *
 * The goal of `ember-element-query` is to let you quickly set breakpoints using
 * these slice names instead of px/em values.
 *
 *
 * Sass mixins
 * ===========
 *
 * `ember-element-query` offers four handy Sass mixins that let you set
 * breakpoint ranges easily: `eq-at`, `eq-from`, `eq-to` and `eq-between`:
 *
 * Styles under `eq-at(s)` are applied when component width is inside the `s`
 * slice, that is between `400px` and `599px`.
 *
 * Styles under `eq-from(s)` are applied when component window width is inside
 * the `s` slice or larger.
 *
 * Styles under `eq-to(s)` are applied when browser window width is inside the
 * `s` slice or smaller.
 *
 * Styles under `eq-between(s, l)` are applied when component width is inside
 * the `s` or`l` slice or any slice between the two (`m` in this case).
 *
 *      Breakpoint:   0                 400px     600px     800px       1050px
 *                    ├───────────────────┼─────────┼─────────┼───────────┼─────────>
 *      Slice:        ·        xs         ·    s    ·    m    ·     l     ·    xl
 *                    ·                   ·         ·         ·           ·
 *                    ·                   ·         ·  at(m)  ·           ·
 *                    ·                   ·         ├─────────┤           ·
 *                    ·                   ·         ·         ·           ·
 *                    ·                   ·         · from(m) ·           ·
 *                    ·                   ·         ├───────────────────────────────>
 *                    ·                   ·                   ·           ·
 *                    ·                   ·            to(m)  ·           ·
 *                    ├───────────────────────────────────────┤           ·
 *                                        ·                               ·
 *                                        ·         between(s, l)         ·
 *                                        ├───────────────────────────────┤
 *
 *
 * Edge cases
 * ==========
 *
 * Note that the largest slice does not have a right edge. When it is invoked,
 * there will be no max-width limitation.
 *
 * Some mixin invokations are synonymous:
 *
 *      Breakpoint:   0                 400px     600px     800px       1050px
 *                    ├───────────────────┼─────────┼─────────┼───────────┼─────────>
 *      Slice:                 xs         ·    s    ·    m          l     ·    xl
 *                                        ·         ·                     ·
 *                                        ·   at(s) ·                     ·  at(xl)
 *                                        ├─────────┤                     ├─────────>
 *                                        ·         ·                     ·
 *                                       between(s, s)                    · from(xl)
 *                                        ├─────────┤                     ├─────────>
 *                                        ·
 *                                        ·                  from(s)
 *                                        ├─────────────────────────────────────────>
 *                                        ·
 *                                        ·              between(s, xl)
 *                                        ├─────────────────────────────────────────>
 *
 * …and some become meaningless, they do not limit anything:
 *
 *      Breakpoint:   0                 400px     600px     800px       1050px
 *                    ├───────────────────┼─────────┼─────────┼───────────┼─────────>
 *      Slice:        ·        xs              s         m          l          xl
 *                    ·
 *                    ·                                                      to(xl)
 *                    ├─────────────────────────────────────────────────────────────>
 *                    ·
 *                    ·     from(xs)
 *                    ├─────────────────────────────────────────────────────────────>
 *
 *
 *
 * Using without Sass, with plain CSS
 * ==================================
 *
 * Sass mixins are merely shortcuts for the following CSS selectors:
 *
 * Sass mixin       | CSS equivalent
 * ---------------- | -----------------------------
 * eq-at(m)         | [data-eq-current="m"]
 * eq-from(m)       | [data-eq-from~="m"]
 * eq-to(m)         | [data-eq-to~="m"]
 * eq-between(s, l) | [data-eq-between~="s-l"]
 *
 *
 * @module ember-element-query
 * @main
 */

module.exports = {
  name: 'ember-element-query'
};
