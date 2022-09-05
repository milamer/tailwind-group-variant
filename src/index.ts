/**
 * @name tailwind-group-variant
 * @license MIT license.
 * @copyright (c) 2022 Christian Schurr
 * @author Christian Schurr <chris@schurr.dev>
 */

const whitespaceChars = [
  ' ',
  '\n',
  '\t',
  '\r',
  '\f',
  '\v',
  '\u00a0',
  '\u1680',
  '\u2000',
  '\u200a',
  '\u2028',
  '\u2029',
  '\u202f',
  '\u205f',
  '\u3000',
  '\ufeff',
]
const badChars = ['"', "'", '`', '\\', '[', '\n', '\r']

const State = {
  init: 'init',
  variantOrWord: 'variantOrWord',
  variant: 'variant',

  'stack.Init': 'stack.Init',
  'stack.VariantOrWord': 'stack.VariantOrWord',
  'stack.Variant': 'stack.Variant',
  'stack.Close': 'stack.Close',
} as const
type State = keyof typeof State

type MatchType = {
  start: number
  end: number
  content: string
}
type StackType = {
  nestedMatches: Array<Omit<StackType, 'nestedMatches'> & {endIdx: number}>
  matches: Array<string>
  variant: string
  startIdx: number
}

type TransformOptions = {
  expandOpenChar?: string
  expandCloseChar?: string
  separatorChar?: string
  variantChar?: string
}

function stackClose(
  machine: TransformMachineState,
  idx: number,
  hasWord: boolean,
) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentStack = machine.context.stack.pop()!

  if (hasWord) {
    currentStack.matches.push(
      machine.context.content.substring(machine.context.variantStartIdx, idx),
    )
  }
  if (machine.context.stack.length > 0) {
    machine.context.stack[machine.context.stack.length - 1]?.nestedMatches.push(
      {
        ...currentStack,
        endIdx: idx,
      },
    )
    machine.state = State['stack.Close']
  } else {
    currentStack.matches.push(
      ...currentStack.nestedMatches.flatMap(nestedStack =>
        nestedStack.matches.map(match => `${nestedStack.variant}${match}`),
      ),
    )
    machine.context.matches.push({
      start: currentStack.startIdx,
      end: idx,
      content: currentStack.matches
        .map(match => `${currentStack.variant}${match}`)
        .join(' '),
    })
    machine.state = State.init
  }
}

function stackError(machine: TransformMachineState) {
  for (const stack of machine.context.stack) {
    if (stack.nestedMatches.length) {
      for (const nestedStack of stack.nestedMatches) {
        machine.context.matches.push({
          start: nestedStack.startIdx,
          end: nestedStack.endIdx,
          content: nestedStack.matches
            .map(match => `${nestedStack.variant}${match}`)
            .join(' '),
        })
      }
    }
  }
  machine.context.stack.length = 0
  machine.state = State.init
}

function openStack(machine: TransformMachineState) {
  machine.state = State['stack.Init']
  machine.context.stack.push({
    matches: [],
    nestedMatches: [],
    variant: machine.context.content.substring(
      machine.context.variantStartIdx,
      machine.context.variantEndIdx + 1,
    ),
    startIdx: machine.context.variantStartIdx,
  })
}

type TransformMachineState = {
  context: {
    matches: Array<MatchType>
    stack: Array<StackType>
    variantStartIdx: number
    variantEndIdx: number
    content: string
  }
  settings: {
    badChars: Array<string>
    variantChar: string
    expandOpen: string
    expandClose: string
    separatorChar: string
  }
  state: State
}
type TransformMachine = Record<
  State,
  (idx: number, char: string, machineState: TransformMachineState) => void
>

const transformMachine: TransformMachine = {
  [State.init]: (idx, char, machineState) => {
    if (!machineState.settings.badChars.includes(char)) {
      machineState.context.variantStartIdx = idx
      machineState.state = State.variantOrWord
    }
  },
  [State.variantOrWord]: (idx, char, machineState) => {
    if (char === machineState.settings.variantChar) {
      machineState.context.variantEndIdx = idx
      machineState.state = State.variant
    } else if (machineState.settings.badChars.includes(char)) {
      machineState.state = State.init
    }
  },
  [State.variant]: (_idx, char, machineState) => {
    if (char === machineState.settings.expandOpen) {
      openStack(machineState)
    } else if (machineState.settings.badChars.includes(char)) {
      machineState.state = State.init
    } else {
      machineState.state = State.variantOrWord
    }
  },
  'stack.Init': (idx, char, machineState) => {
    if (machineState.settings.badChars.includes(char)) {
      stackError(machineState)
    } else if (char === machineState.settings.expandClose) {
      stackError(machineState)
    } else {
      machineState.context.variantStartIdx = idx
      machineState.state = State['stack.VariantOrWord']
    }
  },
  'stack.VariantOrWord': (idx, char, machineState) => {
    if (char === machineState.settings.separatorChar) {
      machineState.context.stack[
        machineState.context.stack.length - 1
      ]?.matches.push(
        machineState.context.content.substring(
          machineState.context.variantStartIdx,
          idx,
        ),
      )
      machineState.state = State['stack.Init']
    } else if (char === machineState.settings.variantChar) {
      machineState.context.variantEndIdx = idx
      machineState.state = State['stack.Variant']
    } else if (char === machineState.settings.expandClose) {
      stackClose(machineState, idx, true)
    }
  },
  'stack.Variant': (_idx, char, machineState) => {
    if (char === machineState.settings.expandOpen) {
      openStack(machineState)
    } else if (machineState.settings.badChars.includes(char)) {
      stackError(machineState)
    } else {
      machineState.state = State['stack.VariantOrWord']
    }
  },
  'stack.Close': (idx, char, machineState) => {
    if (machineState.settings.badChars.includes(char)) {
      stackError(machineState)
    } else if (char === machineState.settings.expandClose) {
      stackClose(machineState, idx, false)
    } else if (char === machineState.settings.separatorChar) {
      machineState.state = State['stack.Init']
    } else {
      stackError(machineState)
    }
  },
}

function transform(content: string, options?: TransformOptions) {
  const machineState: TransformMachineState = {
    context: {
      matches: [],
      stack: [],
      variantStartIdx: 0,
      variantEndIdx: 0,
      content,
    },
    state: State.init,
    settings: {
      badChars: [...badChars, ...whitespaceChars],
      expandClose: options?.expandCloseChar ?? ')',
      expandOpen: options?.expandOpenChar ?? '(',
      separatorChar: options?.separatorChar ?? ',',
      variantChar: options?.variantChar ?? ':',
    },
  }
  for (let idx = 0; idx < content.length; ++idx) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const char = content[idx]!
    const handleIdxForState = transformMachine[machineState.state]

    handleIdxForState(idx, char, machineState)
  }

  const matches = machineState.context.matches

  if (matches.length) {
    let prevStart = 0
    const str = matches.reduce((prev, cur) => {
      const substr = `${prev}${content.substring(prevStart, cur.start)}${
        cur.content
      }`
      prevStart = cur.end + 1
      return substr
    }, '')
    return `${str}${content.substring(prevStart)}`
  }

  return content
}

export default function createTransformer(options?: TransformOptions) {
  return (content: string) => transform(content, options)
}

export type {TransformOptions}
