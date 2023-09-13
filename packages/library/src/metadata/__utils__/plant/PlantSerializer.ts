import type { AggregatedMetadataRegistry, MetadataChecker } from '../../index';
import { PlantMetadataVisitor } from './PlantMetadataVisitor';

export const PlantSerializer = {
  serialize: (metadataChecker: MetadataChecker, metadataRegistry: AggregatedMetadataRegistry) => {
    const visitor = new PlantMetadataVisitor(metadataChecker);
    for (const metadata of metadataRegistry.all()) {
      visitor.visit(metadata);
    }
    return visitor.generatePlantUML();
  },
};
