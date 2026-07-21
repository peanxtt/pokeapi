import { z } from "zod";

const namedResourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
});

const apiResourceSchema = z.object({
  url: z.string().url(),
});

const spriteUrlSchema = z.string().url().nullable();

const spritesSchema = z.object({
  front_default: spriteUrlSchema,
  front_shiny: spriteUrlSchema,
  other: z
    .object({
      "official-artwork": z.object({ front_default: spriteUrlSchema }),
      home: z.object({ front_default: spriteUrlSchema, front_shiny: spriteUrlSchema }),
    })
    .optional(),
});

export const generationSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  main_region: namedResourceSchema,
  pokemon_species: z.array(namedResourceSchema),
});

export const pokemonListSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(namedResourceSchema),
});

export const pokemonSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  is_default: z.boolean(),
  abilities: z.array(
    z.object({
      ability: namedResourceSchema,
      is_hidden: z.boolean(),
    }),
  ),
  forms: z.array(namedResourceSchema),
  moves: z.array(
    z.object({
      move: namedResourceSchema,
      version_group_details: z.array(
        z.object({
          level_learned_at: z.number().int().nonnegative(),
          move_learn_method: namedResourceSchema,
          version_group: namedResourceSchema,
        }),
      ),
    }),
  ),
  past_types: z.array(
    z.object({
      generation: namedResourceSchema,
      types: z.array(
        z.object({
          slot: z.number().int().positive(),
          type: namedResourceSchema,
        }),
      ),
    }),
  ),
  species: namedResourceSchema,
  sprites: spritesSchema,
  stats: z.array(
    z.object({
      base_stat: z.number().int().nonnegative(),
      stat: namedResourceSchema,
    }),
  ),
  types: z.array(
    z.object({
      slot: z.number().int().positive(),
      type: namedResourceSchema,
    }),
  ),
});

export const speciesSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  evolution_chain: apiResourceSchema,
  flavor_text_entries: z.array(
    z.object({
      flavor_text: z.string(),
      language: namedResourceSchema,
    }),
  ),
  form_descriptions: z.array(
    z.object({
      description: z.string(),
      language: namedResourceSchema,
    }),
  ),
  genera: z.array(
    z.object({
      genus: z.string(),
      language: namedResourceSchema,
    }),
  ),
  is_legendary: z.boolean(),
  is_mythical: z.boolean(),
  varieties: z.array(
    z.object({
      is_default: z.boolean(),
      pokemon: namedResourceSchema,
    }),
  ),
});

const evolutionDetailSchema = z.object({
  gender: z.number().int().nullable(),
  held_item: namedResourceSchema.nullable(),
  item: namedResourceSchema.nullable(),
  known_move: namedResourceSchema.nullable(),
  known_move_type: namedResourceSchema.nullable(),
  location: namedResourceSchema.nullable(),
  min_affection: z.number().int().nullable(),
  min_beauty: z.number().int().nullable(),
  min_happiness: z.number().int().nullable(),
  min_level: z.number().int().nullable(),
  needs_overworld_rain: z.boolean(),
  party_species: namedResourceSchema.nullable(),
  party_type: namedResourceSchema.nullable(),
  relative_physical_stats: z.union([z.literal(-1), z.literal(0), z.literal(1)]).nullable(),
  time_of_day: z.string(),
  trade_species: namedResourceSchema.nullable(),
  trigger: namedResourceSchema,
  turn_upside_down: z.boolean(),
});

type ChainLink = {
  is_baby: boolean;
  species: z.infer<typeof namedResourceSchema>;
  evolution_details: z.infer<typeof evolutionDetailSchema>[];
  evolves_to: ChainLink[];
};

const chainLinkSchema: z.ZodType<ChainLink> = z.object({
  is_baby: z.boolean(),
  species: namedResourceSchema,
  evolution_details: z.array(evolutionDetailSchema),
  evolves_to: z.lazy(() => z.array(chainLinkSchema)),
});

export const evolutionChainSchema = z.object({
  id: z.number().int().positive(),
  chain: chainLinkSchema,
});

export type ValidatedEvolutionChain = z.infer<typeof evolutionChainSchema>;
export type ValidatedGeneration = z.infer<typeof generationSchema>;
export type ValidatedPokemon = z.infer<typeof pokemonSchema>;
export type ValidatedPokemonList = z.infer<typeof pokemonListSchema>;
export type ValidatedSpecies = z.infer<typeof speciesSchema>;
