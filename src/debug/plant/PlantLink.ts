import snakeCase from 'lodash.snakecase';

export class PlantLink {
  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly label: string,
    public readonly style: 'solid' | 'dashed' = 'solid',
  ) {}

  public toString(): string {
    const arrow = this.style === 'solid' ? '-->' : '..>';
    const from = snakeCase(this.from);
    const to = snakeCase(this.to);
    const label = this.label ? `: ${this.label}` : '';

    return `${from} ${arrow} ${to} ${label}`;
  }
}
