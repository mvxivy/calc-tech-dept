# Calculate tech dept


This action calculate the amout of comments
```typescript
// TODO
// FIXME
// @ts-ignore
/* FIXME */
/**
* TODO
*/
```

and output in the comment, example:
### Tech dept

| type | count |
| ----- | ----- |
| TODO | 1 |
| FIXME | 2 |
| @ts-ignore | 3 |

P.S. In version 1.0 it works only for languages where comments marks like this: `// single line comment` `/* multiple line comment */`.

## Usage

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Calculate tech dept
    uses: mvxivy/calc-tech-dept@v1.0.0
```
