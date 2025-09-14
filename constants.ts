import type { Hairstyle, Product } from './types';

export const FEMALE_HAIRSTYLES: Hairstyle[] = [
  {
    id: 'sleek-bob',
    name: 'Sleek Bob',
    previewUrl: 'https://picsum.photos/seed/sleek-bob/400/400',
    prompt: 'a sleek, sharp, chin-length bob haircut, very straight and glossy',
    variations: [
      { id: 'sleek-bob-blonde', name: 'Platinum Blonde', promptModifier: 'in a platinum blonde color', previewUrl: 'https://picsum.photos/seed/sleek-bob-blonde/200/200' },
      { id: 'sleek-bob-black', name: 'Jet Black', promptModifier: 'in a jet black color', previewUrl: 'https://picsum.photos/seed/sleek-bob-black/200/200' },
      { id: 'sleek-bob-red', name: 'Vibrant Red', promptModifier: 'in a vibrant red color', previewUrl: 'https://picsum.photos/seed/sleek-bob-red/200/200' },
    ],
  },
  {
    id: 'wavy-lob',
    name: 'Wavy Lob',
    previewUrl: 'https://picsum.photos/seed/wavy-lob/400/400',
    prompt: 'a shoulder-length lob with soft, beachy waves and natural-looking texture',
  },
  {
    id: 'pixie-cut',
    name: 'Textured Pixie',
    previewUrl: 'https://picsum.photos/seed/pixie-cut/400/400',
    prompt: 'a short, textured pixie cut with volume on top and slightly tousled styling',
    variations: [
        { id: 'pixie-cut-short', name: 'Shorter', promptModifier: 'but even shorter and more cropped', previewUrl: 'https://picsum.photos/seed/pixie-cut-short/200/200' },
        { id: 'pixie-cut-long', name: 'Longer', promptModifier: 'with longer bangs swept to the side', previewUrl: 'https://picsum.photos/seed/pixie-cut-long/200/200' },
    ]
  },
  {
    id: 'long-layers',
    name: 'Long Layers',
    previewUrl: 'https://picsum.photos/seed/long-layers/400/400',
    prompt: 'long hair with face-framing layers that create movement and volume',
    variations: [
      { id: 'long-layers-shoulder', name: 'Shoulder Length', promptModifier: 'at shoulder length', previewUrl: 'https://picsum.photos/seed/long-layers-shoulder/200/200' },
      { id: 'long-layers-waist', name: 'Waist Length', promptModifier: 'that is extra long, down to the waist', previewUrl: 'https://picsum.photos/seed/long-layers-waist/200/200' },
      { id: 'long-layers-highlights', name: 'Highlights', promptModifier: 'with subtle blonde highlights', previewUrl: 'https://picsum.photos/seed/long-layers-highlights/200/200' },
    ],
  },
  {
    id: 'curly-shag',
    name: 'Curly Shag',
    previewUrl: 'https://picsum.photos/seed/curly-shag/400/400',
    prompt: 'a modern shag haircut with lots of layers, designed for naturally curly hair to enhance definition and reduce bulk',
  },
  {
    id: 'buzz-cut',
    name: 'Pastel Buzz Cut',
    previewUrl: 'https://picsum.photos/seed/buzz-cut/400/400',
    prompt: 'a very short buzz cut dyed a pastel color',
    variations: [
      { id: 'buzz-cut-lavender', name: 'Lavender', promptModifier: 'in a pastel lavender color', previewUrl: 'https://picsum.photos/seed/buzz-cut-lavender/200/200' },
      { id: 'buzz-cut-pink', name: 'Pink', promptModifier: 'in a pastel pink color', previewUrl: 'https://picsum.photos/seed/buzz-cut-pink/200/200' },
      { id: 'buzz-cut-mint', name: 'Mint Green', promptModifier: 'in a pastel mint green color', previewUrl: 'https://picsum.photos/seed/buzz-cut-mint/200/200' },
    ],
  },
  {
    id: 'mohawk',
    name: 'Punk Mohawk',
    previewUrl: 'https://picsum.photos/seed/mohawk/400/400',
    prompt: 'a striking punk-rock mohawk with tall spikes and shaved sides, colored electric blue',
  },
  {
    id: 'curtain-bangs',
    name: 'Curtain Bangs',
    previewUrl: 'https://picsum.photos/seed/curtain-bangs/400/400',
    prompt: 'long hair with trendy, 70s-style curtain bangs that part in the middle and sweep to the sides',
  },
  {
    id: 'braided-crown',
    name: 'Braided Crown',
    previewUrl: 'https://picsum.photos/seed/braided-crown/400/400',
    prompt: 'an elegant braided crown updo, with intricate braids wrapped around the head like a halo',
  },
  {
    id: 'space-buns',
    name: 'Space Buns',
    previewUrl: 'https://picsum.photos/seed/space-buns/400/400',
    prompt: 'playful double buns (space buns) placed high on the head',
    variations: [
      { id: 'space-buns-glitter', name: 'With Glitter', promptModifier: 'with glitter roots', previewUrl: 'https://picsum.photos/seed/space-buns-glitter/200/200' },
      { id: 'space-buns-purple', name: 'Purple', promptModifier: 'dyed a vibrant purple color', previewUrl: 'https://picsum.photos/seed/space-buns-purple/200/200' },
    ],
  },
  {
    id: 'side-shave',
    name: 'Side Shave',
    previewUrl: 'https://picsum.photos/seed/side-shave/400/400',
    prompt: 'an edgy hairstyle with one side of the head shaved in an undercut, and the rest of the hair long and swept over',
  },
  {
    id: 'hollywood-waves',
    name: 'Hollywood Waves',
    previewUrl: 'https://picsum.photos/seed/hollywood-waves/400/400',
    prompt: 'glamorous, vintage Hollywood waves in long hair, with a deep side part and glossy finish',
  },
  {
    id: 'blunt-bangs',
    name: 'Blunt Bangs',
    previewUrl: 'https://picsum.photos/seed/blunt-bangs/400/400',
    prompt: 'long, straight hair with sharp, blunt-cut bangs that fall straight across the forehead',
  },
];


export const MALE_HAIRSTYLES: Hairstyle[] = [
    {
      id: 'classic-taper',
      name: 'Classic Taper',
      previewUrl: 'https://picsum.photos/seed/classic-taper/400/400',
      prompt: 'a classic taper haircut, short on the sides and back, longer on top, neatly combed',
      variations: [
        { id: 'classic-taper-side-part', name: 'Side Part', promptModifier: 'with a distinct side part', previewUrl: 'https://picsum.photos/seed/classic-taper-side-part/200/200' },
        { id: 'classic-taper-slicked', name: 'Slicked Back', promptModifier: 'slicked back with a wet look', previewUrl: 'https://picsum.photos/seed/classic-taper-slicked/200/200' },
      ],
    },
    {
      id: 'modern-pompadour',
      name: 'Modern Pompadour',
      previewUrl: 'https://picsum.photos/seed/modern-pompadour/400/400',
      prompt: 'a modern pompadour with faded sides and significant volume on top, styled upwards and back',
    },
    {
      id: 'crew-cut',
      name: 'Textured Crew Cut',
      previewUrl: 'https://picsum.photos/seed/crew-cut/400/400',
      prompt: 'a short, textured crew cut, slightly longer on top for a messy, stylish look',
      variations: [
          { id: 'crew-cut-short', name: 'Shorter', promptModifier: 'but an even shorter, military-style crew cut', previewUrl: 'https://picsum.photos/seed/crew-cut-short/200/200' },
          { id: 'crew-cut-blonde', name: 'Blonde', promptModifier: 'with blonde tips', previewUrl: 'https://picsum.photos/seed/crew-cut-blonde/200/200' },
      ]
    },
    {
      id: 'undercut',
      name: 'Slicked Undercut',
      previewUrl: 'https://picsum.photos/seed/undercut/400/400',
      prompt: 'a disconnected undercut with shaved sides and a long top, slicked back for a dramatic contrast',
    },
    {
      id: 'quiff',
      name: 'Voluminous Quiff',
      previewUrl: 'https://picsum.photos/seed/quiff/400/400',
      prompt: 'a haircut featuring a voluminous quiff at the front, with shorter sides',
    },
    {
      id: 'buzz-cut-male',
      name: 'Clean Buzz Cut',
      previewUrl: 'https://picsum.photos/seed/buzz-cut-male/400/400',
      prompt: 'a very short, clean and uniform buzz cut',
      variations: [
        { id: 'buzz-cut-male-fade', name: 'With Fade', promptModifier: 'with a skin fade on the sides', previewUrl: 'https://picsum.photos/seed/buzz-cut-male-fade/200/200' },
        { id: 'buzz-cut-male-lineup', name: 'Line-Up', promptModifier: 'with a sharp, defined hairline (line-up)', previewUrl: 'https://picsum.photos/seed/buzz-cut-male-lineup/200/200' },
      ],
    },
    {
      id: 'long-hair-male',
      name: 'Shoulder Length',
      previewUrl: 'https://picsum.photos/seed/long-hair-male/400/400',
      prompt: 'natural, shoulder-length hair, styled with a slight wave',
    },
    {
      id: 'man-bun',
      name: 'High Man Bun',
      previewUrl: 'https://picsum.photos/seed/man-bun/400/400',
      prompt: 'long hair tied up into a high, neat man bun with clean sides',
    },
    {
      id: 'curly-fringe',
      name: 'Curly Fringe',
      previewUrl: 'https://picsum.photos/seed/curly-fringe/400/400',
      prompt: 'a curly fringe hairstyle with short, faded sides and longer, naturally curly hair on top styled forward',
    },
    {
      id: 'faux-hawk',
      name: 'Faux Hawk',
      previewUrl: 'https://picsum.photos/seed/faux-hawk/400/400',
      prompt: 'a stylish faux hawk (fohawk) with short sides and a thicker strip of hair on top styled towards the center',
      variations: [
        { id: 'faux-hawk-spiky', name: 'Spiky', promptModifier: 'with a spikier texture', previewUrl: 'https://picsum.photos/seed/faux-hawk-spiky/200/200' },
        { id: 'faux-hawk-subtle', name: 'Subtle', promptModifier: 'that is more subtle and less defined', previewUrl: 'https://picsum.photos/seed/faux-hawk-subtle/200/200' },
      ],
    },
    {
      id: 'caesar-cut',
      name: 'Caesar Cut',
      previewUrl: 'https://picsum.photos/seed/caesar-cut/400/400',
      prompt: 'a classic Caesar cut, characterized by short, horizontally straight-cut bangs',
    },
    {
      id: 'bro-flow',
      name: 'Bro Flow',
      previewUrl: 'https://picsum.photos/seed/bro-flow/400/400',
      prompt: 'a medium-length "bro flow" hairstyle, where the hair is grown out and swept back off the face naturally',
    },
    {
      id: 'cornrows-male',
      name: 'Cornrows',
      previewUrl: 'https://picsum.photos/seed/cornrows-male/400/400',
      prompt: 'neatly braided cornrows, styled straight back',
    },
  ];

export const PRODUCTS: Product[] = [
  { id: 'prod-shampoo', name: 'Nourishing Shampoo', price: 25, inStock: 32, isDemo: true },
  { id: 'prod-conditioner', name: 'Silk Conditioner', price: 28, inStock: 25, isDemo: true },
  { id: 'prod-hairspray', name: 'Strong Hold Hairspray', price: 18, inStock: 40, isDemo: true },
  { id: 'prod-serum', name: 'Glossing Serum', price: 35, inStock: 15, isDemo: true },
];