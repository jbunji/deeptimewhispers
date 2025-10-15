# Google Analytics 4 Setup Guide for Deep Time Whispers

## 🎯 **Setup Instructions**

### Step 1: Create Google Analytics 4 Property
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create new account: "Deep Time Whispers"
3. Create new property: "Deep Time Whispers Website"
4. Select "Web" platform
5. Copy your Measurement ID (format: G-XXXXXXXXXX)

### Step 2: Replace Placeholder ID
Replace `G-XXXXXXXXXX` in ALL these files with your actual Measurement ID:
- `index.html` (lines 96, 102)
- `timeline.html` (lines 22, 28)
- `ancient-earth-viewer.html` (lines 14, 20)
- `cosmic-calendar.html` (lines 21, 27)
- `episodes.html` (lines 21, 27)
- `ask-chrononaut.html` (lines 21, 27)

### Step 3: Configure Custom Events
In GA4 dashboard, set up these custom events for conversion tracking:

#### **Primary Conversions**
1. **spotify_click** - When users click Spotify links
   - Conversion: Yes
   - Value: $2 (estimated podcast value)
   
2. **episode_play** - When users start episode playback
   - Conversion: Yes
   - Value: $1 (engagement value)

#### **Engagement Events**
1. **timeline_interaction** - Timeline usage
2. **ancient_earth_interaction** - Ancient Earth tool usage
3. **cosmic_calendar_interaction** - Cosmic calendar usage
4. **qa_interaction** - Ask Chrononaut engagement

### Step 4: Enhanced E-commerce (Optional)
Set up Enhanced E-commerce to track "content consumption" as products:
- Episodes as "products"
- Categories: Sleep Journey, Catastrophe, Ancient Lives
- Track "purchases" as full episode completions

## 📊 **Custom Dimensions Setup**

### Custom Dimensions to Create:
1. **page_type** (index 1)
   - Scope: Event
   - Values: homepage, timeline, ancient_earth, cosmic_calendar, episodes, qa

2. **episode_category** (index 2)
   - Scope: Event  
   - Values: long_format, catastrophe, ancient_lives

3. **geological_period** (index 3)
   - Scope: Event
   - Values: hadean, archean, proterozoic, paleozoic, mesozoic, cenozoic

4. **interaction_depth** (index 4)
   - Scope: Event
   - Values: surface, engaged, deep

### Custom Metrics to Create:
1. **time_explored** - Total MYA explored in timeline
2. **questions_viewed** - Number of Q&A interactions
3. **location_searches** - Ancient Earth location searches

## 🎯 **Goal Configuration**

### Primary Goals:
1. **Podcast Discovery** (spotify_click events)
   - Tracks when users find the podcast
   - Target: 100 clicks/month

2. **Educational Engagement** (session_duration > 5 minutes)
   - Tracks meaningful interaction with content
   - Target: 60% of sessions

3. **Tool Usage** (timeline + ancient_earth + cosmic_calendar interactions)
   - Tracks interactive feature adoption
   - Target: 40% of sessions use tools

4. **Content Discovery** (episode_page_views)
   - Tracks episode catalog engagement
   - Target: 30% of users view episodes

### Micro-conversions:
- Newsletter signup (when implemented)
- Social media follows
- Question submissions
- Location searches in Ancient Earth

## 📈 **Reporting Setup**

### Custom Reports to Create:

#### **1. Educational Engagement Report**
- Primary Dimension: Page Title
- Metrics: Average Session Duration, Pages per Session, Bounce Rate
- Filters: Session duration > 30 seconds

#### **2. Tool Usage Analysis**
- Primary Dimension: Event Name  
- Secondary Dimension: Page Title
- Metrics: Event Count, Unique Users
- Filters: Event Category contains "interaction"

#### **3. Podcast Funnel Report**
- Steps: Homepage → Episodes Page → Spotify Click
- Conversion tracking through the podcast discovery journey

#### **4. Content Performance Dashboard**
- Episodes by play rate
- Timeline periods by engagement
- Ancient Earth locations by search frequency
- Q&A questions by view count

### Automated Insights:
- Weekly performance summary
- Anomaly detection for traffic spikes
- User behavior flow analysis
- Conversion funnel drop-off alerts

## 🔔 **Alert Setup**

### Critical Alerts:
1. **Traffic Drop** (>50% decrease week-over-week)
2. **Conversion Drop** (>30% decrease in spotify_clicks)
3. **Page Error Spike** (>10% increase in 404s)
4. **Site Speed Issues** (Core Web Vitals decline)

### Growth Alerts:
1. **Traffic Spike** (>200% increase day-over-day)
2. **Viral Content** (Single page >1000 views/day)
3. **New User Surge** (>100 new users/day)

## 🔗 **Integration Setup**

### Google Search Console Integration:
1. Link GA4 property to Search Console
2. Enable Search Console reports in GA4
3. Track organic search performance by page

### YouTube Integration (when ready):
1. Link YouTube channel to GA4
2. Track video engagement alongside website
3. Cross-platform user journey analysis

### Social Media Tracking:
1. UTM parameters for all social links
2. Campaign tracking for Reddit/Twitter posts
3. Influencer collaboration measurement

## 📱 **Mobile App Preparation**
If you later create a mobile app:
1. Use same GA4 property
2. Enable cross-platform tracking
3. Track app-to-web and web-to-app flows

## 🔒 **Privacy & Compliance**

### Cookie Consent (Required):
1. Implement cookie banner
2. Respect user consent choices
3. Enable data deletion requests

### Data Retention:
- Set to 14 months (maximum)
- Regular data exports for backup
- Compliance with GDPR/CCPA

## 🚀 **Launch Checklist**

- [ ] Replace G-XXXXXXXXXX with real Measurement ID
- [ ] Test all tracking events work properly
- [ ] Verify Real-time reports show data
- [ ] Set up custom dimensions and metrics
- [ ] Configure goals and conversions
- [ ] Create custom reports and dashboards
- [ ] Set up automated alerts
- [ ] Link Google Search Console
- [ ] Test mobile tracking
- [ ] Document all tracking for team

## 📊 **Success Metrics (90 Days)**

### Traffic Goals:
- 10,000 monthly organic visitors
- 50% returning visitor rate
- 5+ minute average session duration

### Engagement Goals:
- 40% of sessions use interactive tools
- 25% of users visit multiple pages
- 10% conversion rate to Spotify

### Educational Goals:
- 20 teacher testimonials/shares
- 100+ questions in Ask Chrononaut
- 50+ Ancient Earth location searches/day

*This analytics setup will provide comprehensive insights into how users discover, engage with, and convert through the Deep Time Whispers ecosystem.*