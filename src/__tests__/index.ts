import createTransformer from '../'
import type {TransformOptions} from '../'

type TestCase = {
  input: string
  output: string
  options?: TransformOptions
  only?: boolean
  skip?: boolean
}

const tests: Record<string, TestCase> = {
  'normal variant': {
    input: `test lg:p-2 lg:m-3`,
    output: `test lg:p-2 lg:m-3`,
  },
  'expand variant': {
    input: `test lg:(p-2,m-3)`,
    output: `test lg:p-2 lg:m-3`,
  },
  'expand nested variant': {
    input: `test dark:(p-2,m-3,lg:(p-3,m-4))`,
    output: `test dark:p-2 dark:m-3 dark:lg:p-3 dark:lg:m-4`,
  },
  'only use nested variant when outer has error': {
    input: `test dark:(p-2,m-3,lg:(p-3,m-4) )`,
    output: `test dark:(p-2,m-3,lg:p-3 lg:m-4 )`,
  },
  'bad char after variant': {
    input: `test dark: (p-2,m-3 lg:(p-3,m-4) )`,
    output: `test dark: (p-2,m-3 lg:p-3 lg:m-4 )`,
  },
  'bad char after stack opens': {
    input: `test dark:( p-2,m-3 lg:(p-3,m-4) )`,
    output: `test dark:( p-2,m-3 lg:p-3 lg:m-4 )`,
  },
  'close after open': {
    input: `test dark:() p-2,m-3 lg:(p-3,m-4)`,
    output: `test dark:() p-2,m-3 lg:p-3 lg:m-4`,
  },
  'bad char after nested variant': {
    input: `test dark:(p-2,m-3,lg: (p-3,m-4))`,
    output: `test dark:(p-2,m-3,lg: (p-3,m-4))`,
  },
  'nested normal variant': {
    input: `test dark:(p-2,m-3,hover:text-blue)`,
    output: `test dark:p-2 dark:m-3 dark:hover:text-blue`,
  },
  'nested group in middle of group': {
    input: `test dark:(p-2,m-3,hover:(text-blue,bg-red),text-red)`,
    output: `test dark:p-2 dark:m-3 dark:text-red dark:hover:text-blue dark:hover:bg-red`,
  },
  'random char after stack close': {
    input: `test dark:(p-2,m-3)a`,
    output: `test dark:p-2 dark:m-3a`,
  },
  'random char after nested stack close': {
    input: `test dark:(p-2,m-3,lg:(p-3,m-4)a)`,
    output: `test dark:(p-2,m-3,lg:p-3 lg:m-4a)`,
  },
}

describe.each(Object.entries(tests))(
  'group variants',
  (title, {input, output, only = false, skip = false, options}) => {
    const testFn = () =>
      expect(createTransformer(options)(input)).toEqual(output)

    if (only) {
      test.only(title, testFn)
    } else if (skip) {
      test.skip(title, testFn)
    } else {
      test(title, testFn)
    }
  },
)

/*
eslint
  jest/valid-title: "off",
  jest/no-disabled-tests: "off",
  jest/no-focused-tests: "off",
  @typescript-eslint/no-unsafe-call: "off",
  @typescript-eslint/no-unsafe-member-access: "off"
*/
