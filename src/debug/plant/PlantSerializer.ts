import type { GlobalMetadataRegistry, MetadataChecker } from '../../metadata';
import { PlantMetadataVisitor } from './PlantMetadataVisitor';

export const PlantSerializer = {
  serialize: (metadataChecker: MetadataChecker, metadataRegistry: GlobalMetadataRegistry) => {
    const visitor = new PlantMetadataVisitor(metadataChecker);
    for (const metadata of metadataRegistry.all()) {
      visitor.visit(metadata);
    }
    return visitor.generatePlantUML();
  },
};
