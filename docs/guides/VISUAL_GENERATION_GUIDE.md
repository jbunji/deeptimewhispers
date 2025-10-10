# Deep Time Whispers: Visual Asset Generation Guide

## Overview
This guide provides instructions for generating image and video prompts to accompany Deep Time Whispers audio stories. Visual assets are designed for long-form, meditative content where each image stays on screen for extended periods, creating an immersive experience that complements The Chrononaut's narration.

## Visual Asset Types & Pacing

### 1. Smarter Slideshow Images
**Duration**: 45-90 seconds per image
**Purpose**: Foundation visuals that carry the bulk of the story
**Quantity**: ~60-80 images for a 3-hour video
**Prompt Style**: Photorealistic, detailed, atmospheric

### 2. Living Diorama Images
**Duration**: 3-7 minutes per scene
**Purpose**: Epic centerpiece moments that deserve extended viewing
**Quantity**: 6-8 images for a 3-hour video
**Prompt Style**: Highly detailed, multi-layered, suitable for slow camera movements

### 3. AI-Animated Clips
**Duration**: 10-20 seconds each
**Purpose**: Brief moments of specific action or movement
**Quantity**: 10-15 clips for a 3-hour video
**Prompt Style**: Action-focused, clear movement direction

### 4. Abstract Texture Clips
**Duration**: 20 seconds (can be slowed to 2-3 minutes)
**Purpose**: Transitional moments or philosophical reflections
**Quantity**: 4-5 clips for a 3-hour video
**Prompt Style**: Abstract, flowing, atmospheric

### 5. Establishing Shots
**Duration**: 60-120 seconds
**Purpose**: Set the scene for new chapters or major transitions
**Quantity**: 8-10 for a 3-hour video
**Prompt Style**: Wide vistas, epic scale, environmental storytelling

### 6. Macro Detail Shots
**Duration**: 30-60 seconds
**Purpose**: Intimate moments focusing on specific details
**Quantity**: 15-20 for a 3-hour video
**Prompt Style**: Extreme close-ups, textural focus

## Prompt Generation Format

When generating prompts, use this format:

```
[ASSET TYPE] - [TIMESTAMP RANGE]
Story Context: [Brief description of what's happening in the narration]
Visual Prompt: [Detailed prompt for image/video generation]
Technical Notes: [Any specific requirements like aspect ratio, movement direction, etc.]
```

## Prompt Writing Guidelines

### For Slideshow Images
- Include atmospheric elements (fog, light rays, particles)
- Specify time of day and lighting conditions
- Add environmental context (weather, season, geological features)
- Use cinematic language (depth of field, composition)

Example:
```
[SLIDESHOW] - [00:45-02:15]
Story Context: The Chrononaut describes the early Earth's toxic atmosphere
Visual Prompt: A primordial Earth landscape at dawn, thick orange-brown methane fog rolling across black volcanic rock, pools of bubbling tar reflecting a dim red sun barely visible through dense atmospheric haze, lightning crackling in the distance, no life visible, cinematic wide shot with shallow depth of field
Technical Notes: 16:9 aspect ratio, muted color palette emphasizing oranges and browns
```

### For Living Dioramas
- Create scenes with multiple focal points for camera movement
- Include foreground, midground, and background elements
- Add subtle animation potential (smoke, mist, water)
- Think in terms of a "living painting"

Example:
```
[LIVING DIORAMA] - [15:30-21:30]
Story Context: The Cambrian Explosion underwater scene
Visual Prompt: A vibrant Cambrian seafloor teeming with early life, Anomalocaris hunting in the midground, fields of sea lilies swaying in the foreground, trilobites scuttling across the sandy bottom, Hallucigenia and Opabinia visible among coral-like structures, shafts of blue-green sunlight filtering through clear ancient waters, particles floating in the water column
Technical Notes: High resolution for zoom capability, rich color palette, multiple layers of depth
```

### For Animated Clips
- Specify exact movement or action
- Keep scenes simple with clear focal points
- Include start and end positions
- Note speed and direction of movement

Example:
```
[ANIMATED CLIP] - [45:20-45:35]
Story Context: A meteor enters Earth's atmosphere
Visual Prompt: A massive iron meteor streaking through a purple twilight sky, entering from top left moving to bottom right, leaving a trail of orange fire and smoke, stars visible in background, silhouette of prehistoric landscape below
Technical Notes: 15-second clip, smooth motion, emphasis on the fire trail
```

### For Abstract Textures
- Focus on colors, patterns, and flow
- Avoid recognizable objects
- Emphasize mood and feeling
- Consider how it will look when slowed down

Example:
```
[ABSTRACT TEXTURE] - [1:32:00-1:35:00]
Story Context: Philosophical reflection on deep time
Visual Prompt: Swirling patterns of cosmic dust in deep purples and blues, particles flowing like underwater currents, occasional sparkles of light like distant stars, organic flow patterns suggesting both galaxies and microscopic life
Technical Notes: Seamless loop if possible, works well at 10% playback speed
```

## Timestamp Notation

When analyzing audio files:
1. Note major topic transitions
2. Identify centerpiece moments worthy of Living Dioramas
3. Mark action sequences needing animation
4. Flag philosophical sections for abstract textures

Format: [HH:MM:SS-HH:MM:SS]

## Asset Distribution Example (3-Hour Video)

```
Hour 1:
- Slideshow Images: 25-30
- Living Dioramas: 2-3
- Animated Clips: 3-5
- Abstract Textures: 1-2

Hour 2:
- Slideshow Images: 20-25
- Living Dioramas: 2-3
- Animated Clips: 4-5
- Abstract Textures: 1-2

Hour 3:
- Slideshow Images: 15-20
- Living Dioramas: 2
- Animated Clips: 3-5
- Abstract Textures: 1-2
```

## Special Considerations

### Color Psychology for Sleep Content
- Favor cooler tones (blues, purples, deep greens)
- Avoid bright reds or yellows except for specific moments
- Use muted, desaturated colors for calming effect
- Gradual color transitions between scenes

### Movement and Pacing
- Slow, steady movements only
- No sudden changes or jarring transitions
- Camera movements should be barely perceptible
- Natural, organic flow in all animations

### Consistency Across Assets
- Maintain stylistic coherence throughout
- Use recurring visual motifs
- Keep similar color grading approach
- Match level of detail across asset types

## Workflow Instructions

When asked to generate visual prompts for a story:

1. **Read/Listen to the Story**
   - Identify major narrative sections
   - Note emotional peaks and valleys
   - Mark scientific concepts needing visualization

2. **Plan Asset Distribution**
   - Map out Living Diorama moments first
   - Fill in with Slideshow images
   - Add Animated Clips for specific actions
   - Place Abstract Textures at transitions

3. **Generate Prompts**
   - Start with establishing shots
   - Work chronologically through the story
   - Ensure each prompt serves the narrative
   - Include technical specifications

4. **Review and Refine**
   - Check pacing (no asset changes too frequently)
   - Verify all major story beats have visuals
   - Ensure sleep-appropriate content throughout

## Command Format

When ready to generate visual prompts:
```
Generate visual asset prompts for [STORY TITLE] audio file located at [FILE PATH]
```

The response will include:
- Total asset count by type
- Chronological list of all prompts with timestamps
- Special notes for complex scenes
- Suggested editing transitions

## Quality Checklist
- [ ] All prompts are sleep-appropriate (no jarring content)
- [ ] Timestamps align with story narration
- [ ] Asset types match the pacing guidelines
- [ ] Sufficient detail for AI image generation
- [ ] Technical specifications included where needed
- [ ] Variety in compositions and perspectives
- [ ] Consistency in style and mood throughout