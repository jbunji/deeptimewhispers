# Deep Time Whispers - Midjourney Visual Prompt Generation Guide

## Overview
This guide provides a standardized framework for generating Midjourney prompts from any Deep Time Whispers story. Use this when creating visual assets for DaVinci Resolve video production.

## Visual Asset Categories & Timing

### 1. **Establishing Shots** (ES)
- **Duration**: 60-120 seconds each
- **Purpose**: Set the scene for major transitions
- **Quantity**: 8-10 per 3-hour story
- **Prompt Structure**: Wide vistas, epic scale, environmental context

### 2. **Slideshow Images** (SS)
- **Duration**: 45-90 seconds each
- **Purpose**: Carry the narrative flow
- **Quantity**: 60-80 per 3-hour story
- **Prompt Structure**: Specific moments, creatures, or phenomena

### 3. **Living Dioramas** (LD)
- **Duration**: 3-7 minutes each
- **Purpose**: Epic centerpiece moments
- **Quantity**: 6-8 per 3-hour story
- **Prompt Structure**: Complex scenes with multiple elements

### 4. **Macro Detail Shots** (MD)
- **Duration**: 30-60 seconds each
- **Purpose**: Intimate examination of details
- **Quantity**: 15-20 per 3-hour story
- **Prompt Structure**: Extreme close-ups, textures, microscopic views

### 5. **Abstract Textures** (AT)
- **Duration**: 20 seconds (expandable to 2-3 minutes)
- **Purpose**: Transitions and philosophical moments
- **Quantity**: 4-5 per 3-hour story
- **Prompt Structure**: Flowing patterns, non-literal visualizations

### 6. **Animated Clips** (AC)
- **Duration**: 10-20 seconds each
- **Purpose**: Specific actions or movements
- **Quantity**: 10-15 per 3-hour story
- **Prompt Structure**: Clear motion, simple scenes

## Midjourney Prompt Formula

### Base Structure:
```
[Subject/Scene Description], [Environmental Context], [Lighting/Atmosphere], [Color Palette], [Style/Quality Modifiers] --ar 16:9 --v 6
```

### Essential Elements for Every Prompt:
1. **Clear Subject** - What is the main focus?
2. **Environmental Context** - Where/when is this happening?
3. **Lighting Description** - How is the scene lit?
4. **Color Palette** - Deep Time Whispers brand colors
5. **Technical Specifications** - Always include `--ar 16:9`

## Deep Time Whispers Color Palette
- **Primary**: Deep purples (#2D1B69)
- **Secondary**: Ocean teals (#0A4F63)
- **Accent**: Amber/gold (#D4A574)
- **Supporting**: Midnight blues, soft lavenders
- **Atmosphere**: Bioluminescent glows, filtered sunlight

## Prompt Templates by Category

### Establishing Shot Template:
```
[Wide view of ancient environment], [geological/temporal setting], [atmospheric conditions], cathedral-like light rays, deep purple and teal color palette, cinematic composition, epic scale --ar 16:9 --v 6
```

### Slideshow Image Template:
```
[Specific creature or phenomenon], [action or state], [immediate environment], [lighting quality], photorealistic detail, documentary style, [specific colors] --ar 16:9 --v 6
```

### Living Diorama Template:
```
[Complex scene with multiple elements listed], [relationships between elements], [environmental depth and layers], volumetric lighting, rich detail throughout, multiple focal points for camera movement --ar 16:9 --v 6 --quality 2
```

### Macro Detail Template:
```
Extreme close-up of [specific detail], [texture descriptions], [micro-environment], shallow depth of field, scientific photography style, crystalline detail --ar 16:9 --v 6
```

### Abstract Texture Template:
```
Abstract flowing patterns representing [concept], [movement type], [color transitions], seamless loop potential, dreamlike quality, no recognizable objects --ar 16:9 --v 6
```

### Animated Clip Template:
```
[Clear action verb] [subject] [specific movement], [start to end position], [environment], motion blur implied, clear focal point, simple composition --ar 16:9 --v 6
```

## Story Analysis Process

### Step 1: Read Story & Identify Key Moments
1. Mark major scene changes
2. Note creatures/objects described in detail
3. Identify emotional peaks
4. Find transition points

### Step 2: Categorize Visual Needs
- **Epic moments** → Living Dioramas
- **Scene settings** → Establishing Shots
- **Specific descriptions** → Slideshow Images
- **Detailed features** → Macro Details
- **Transitions** → Abstract Textures
- **Actions** → Animated Clips

### Step 3: Time Distribution
For a 3-hour story:
- Hour 1: 40% of visuals (establish world)
- Hour 2: 35% of visuals (deepen exploration)
- Hour 3: 25% of visuals (personal connection)

## Midjourney Best Practices

### Quality Modifiers:
- `photorealistic` - For realistic scenes
- `documentary style` - For educational feel
- `cinematic lighting` - For dramatic effect
- `scientific illustration` - For accuracy
- `--quality 2` - For hero shots only
- `--style raw` - For photographic quality

### Avoid These:
- Text in images
- Modern elements
- Bright/harsh lighting
- Cluttered compositions
- Breaking 16:9 aspect ratio

### Pro Tips:
1. Generate variations using same prompt with `--chaos 10-30`
2. Use `volumetric lighting` for underwater scenes
3. Add `particles floating` for depth
4. Include `god rays` or `cathedral light` for majesty
5. Specify `shallow depth of field` for focus

## Prompt Generation Workflow

### 1. Initial Setup:
```
Title: [Story Name] Visual Prompts
Total Duration: [X hours]
Key Themes: [List 3-5 themes]
Color Emphasis: [Specific to story]
```

### 2. Prompt Format:
```
### [ASSET TYPE] - [TIMESTAMP-TIMESTAMP]
Story Context: [What's happening in narration]
Visual Prompt: [Complete Midjourney prompt]
Technical Notes: [Special considerations]
```

### 3. Organization:
- Group by hour
- Number sequentially
- Include timing for each
- Note connections between scenes

## Example Analysis Framework

When analyzing a story, look for:

### Visual Trigger Words:
- "I observe" → Slideshow Image
- "I witness" → Animated Clip or Diorama
- "I examine closely" → Macro Detail
- "The world transforms" → Abstract Texture
- "I find myself" → Establishing Shot

### Emotional Cues:
- Wonder/Awe → Epic establishing shots
- Intimacy → Macro details
- Action → Animated clips
- Reflection → Abstract textures
- Discovery → Living dioramas

## File Naming Convention
When saving generated images:
```
[###]_[TYPE]_[MMSS]_[descriptor].jpg
Example: 001_ES_0000_primordial_earth.jpg
```

## Quick Reference Checklist

Before generating prompts, ensure you have:
- [ ] Read entire story
- [ ] Identified 6-8 centerpiece moments
- [ ] Noted all creatures/objects described
- [ ] Marked emotional peaks
- [ ] Calculated total visual needs
- [ ] Assigned timestamps
- [ ] Included Deep Time color palette
- [ ] Added 16:9 aspect ratio to all
- [ ] Varied prompt styles appropriately
- [ ] Included technical notes

## Template for New Story

```markdown
# [Story Title] - Visual Asset Prompts

## Total Asset Count
- Living Dioramas: X (3-7 min each)
- Slideshow Images: X (45-90 sec each)
- Animated Clips: X (10-20 sec each)
- Abstract Textures: X (20 sec/2-3 min)
- Establishing Shots: X (60-120 sec each)
- Macro Detail Shots: X (30-60 sec each)

## HOUR 1: [Theme]

### [ASSET TYPE] - [00:00:00-00:00:00]
Story Context: 
Visual Prompt: 
Technical Notes: 

[Continue for all assets...]
```

---

Remember: The goal is immersive, sleep-inducing visuals that support The Chrononaut's narrative without overwhelming it. Every image should feel like a meditation on deep time.