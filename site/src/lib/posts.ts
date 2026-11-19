// Un artículo se publica cuando no es borrador y su fecha ya ha llegado.
// La web se recompila cada mañana (cron en pages.yml), así que un artículo con
// fecha futura aparece solo el día que toca.
import type { CollectionEntry } from 'astro:content';

export const isPublished = ({ data }: CollectionEntry<'blog'>) =>
  !data.draft && data.date.valueOf() <= Date.now();
