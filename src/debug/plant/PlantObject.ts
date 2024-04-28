import snakeCase from 'lodash.snakecase';

export type PlantObjectConfig = {
  id: string;
  name: string;
  color?: string;
  properties?: Record<string, unknown>;
};

export class PlantObject {
  public readonly id: string;
  public readonly name: string;
  public readonly color?: string;
  public readonly properties: Record<string, unknown> = {};

  constructor(config: PlantObjectConfig) {
    this.id = config.id;
    this.name = config.name;

    if (config.color) {
      this.color = config.color;
    }

    if (config.properties) {
      Object.assign(this.properties, config.properties);
    }
  }

  public toString(): string {
    const id = snakeCase(this.id);
    const name = JSON.stringify(this.name);
    const color = this.color ? ` ${this.color}` : '';

    return [
      `object ${name} as ${id}${color}`,
      ...Object.entries(this.properties).map(([key, value]) => {
        const stringifiedValue = JSON.stringify(value, undefined, 2);
        const escapedValue = stringifiedValue.replace(/\n/g, '\\n');

        return `${id} : ${key} = ${escapedValue}`;
      }),
    ].join('\n');
  }
}
