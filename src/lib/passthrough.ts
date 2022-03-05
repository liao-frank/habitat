export const passthrough = <T>(wrapper: any, instance: T): wrapper is T => {
  for (const key in instance) {
    if (wrapper[key]) continue

    const property = instance[key]

    if (typeof property === 'function') {
      wrapper[key] = property.bind(instance)
      continue
    }

    Object.defineProperty(wrapper, key, {
      get: () => instance[key],
      set: (value) => instance[key] === value,
    })
  }

  return true
}
