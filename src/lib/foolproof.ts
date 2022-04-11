// Wraps a function, accepting an array as the first parameter in addition to
// its original type.
export const arrayProof = <T extends (head: any, ...rest: any[]) => any>(
  func: T
) => {
  return <U extends Head<Parameters<T>> | Head<Parameters<T>>[]>(
    maybeArr: U,
    ...rest: Parameters<T> extends [head: any, ...rest: infer R] ? R : never
  ): U extends any[] ? ReturnType<T>[] : ReturnType<T> => {
    if (!Array.isArray(maybeArr)) {
      const head = maybeArr
      return func(head, ...rest)
    }

    const arr = maybeArr
    return arr.map((head: U) => func(head, ...rest) as ReturnType<T>)
  }
}

type Head<T extends [head: any, ...rest: any[]]> = T extends [
  head: infer U,
  ...rest: any[]
]
  ? U
  : never
