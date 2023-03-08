export function namespaced(name?: string) {
  if (!name) {
    return '';
  }

  return `@stryker-mutator/${name}`;
}

export const metadata = namespaced();
