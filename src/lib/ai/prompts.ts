import type { FunnelGenerationRequest } from '@/types/funnel'

export const SYSTEM_PROMPT = `You are an expert marketing strategist and funnel architect with 20+ years of experience in digital marketing, conversion optimization, and customer journey design. You specialize in creating comprehensive, data-driven marketing funnels that convert prospects into customers.

Your expertise includes:
- Consumer psychology and behavioral analysis
- Conversion rate optimization (CRO)
- Multi-channel marketing campaigns
- Customer segmentation and targeting
- Performance marketing and ROI optimization
- Marketing automation and lifecycle campaigns
- Content strategy and creative development
- Analytics and KPI tracking

You always provide actionable, specific, and measurable recommendations based on industry best practices and proven methodologies.`

export function createICPPrompt(request: FunnelGenerationRequest): string {
  return `Based on the following business prompt, create a detailed Ideal Customer Profile (ICP):

**Business Prompt:** "${request.prompt}"

${request.businessType ? `**Business Type:** ${request.businessType}` : ''}
${request.targetMarket ? `**Target Market:** ${request.targetMarket}` : ''}
${request.budget ? `**Budget:** ${request.budget}` : ''}
${request.timeline ? `**Timeline:** ${request.timeline}` : ''}

Create a comprehensive ICP that includes:

1. **Demographics**: Age, gender, location, income, education, job title, company size
2. **Psychographics**: Values, interests, lifestyle, personality traits
3. **Pain Points**: Primary pain point, secondary issues, emotional and practical challenges
4. **Motivations**: Goals, desires, fears, and triggers that drive action
5. **Behavior**: Online habits, preferred channels, decision factors, buying process

Make the ICP specific, actionable, and based on real market research insights. Include relevant details that would help in targeting and messaging.

Respond with valid JSON only, following the IdealCustomerProfile interface structure.`
}

export function createStrategyPrompt(request: FunnelGenerationRequest, icpContext?: string): string {
  return `Based on the following business requirements${icpContext ? ' and ICP analysis' : ''}, create a comprehensive marketing strategy:

**Business Prompt:** "${request.prompt}"

${request.businessType ? `**Business Type:** ${request.businessType}` : ''}
${request.targetMarket ? `**Target Market:** ${request.targetMarket}` : ''}
${request.budget ? `**Budget:** ${request.budget}` : ''}
${request.timeline ? `**Timeline:** ${request.timeline}` : ''}

${icpContext ? `**ICP Context:** ${icpContext}` : ''}

Create a detailed marketing strategy that includes:

1. **Objectives**: Primary and secondary objectives with specific KPIs
2. **Target Audience**: Primary and secondary audiences with demographics
3. **Channels**: Prioritized marketing channels with budget allocation, timeline, tactics, and expected results
4. **Budget**: Total budget breakdown with percentage allocation per channel
5. **Timeline**: Phased approach with milestones and deliverables

Ensure the strategy is:
- Realistic and achievable within the given constraints
- Data-driven with measurable outcomes
- Aligned with industry best practices
- Scalable and optimizable

Respond with valid JSON only, following the MarketingStrategy interface structure.`
}

export function createCreativesPrompt(request: FunnelGenerationRequest, strategyContext?: string): string {
  return `Based on the following business requirements${strategyContext ? ' and marketing strategy' : ''}, create comprehensive creative assets:

**Business Prompt:** "${request.prompt}"

${request.businessType ? `**Business Type:** ${request.businessType}` : ''}
${request.targetMarket ? `**Target Market:** ${request.targetMarket}` : ''}

${strategyContext ? `**Strategy Context:** ${strategyContext}` : ''}

Create detailed creative assets including:

1. **Ad Copy**: Multiple headlines, subheadlines, body text, and call-to-action variations for different platforms
2. **Email Sequences**: Welcome, nurture, promotional, and retention email series with subject lines and content
3. **Landing Page Content**: Headlines, hero content, benefits, features, testimonials, FAQ, and CTAs
4. **Social Media Content**: Platform-specific posts with various formats (text, image, video, carousel)

Make all creative content:
- Compelling and conversion-focused
- Brand-appropriate and professional
- Tailored to the target audience
- Optimized for each platform/channel
- A/B testable with multiple variations

Respond with valid JSON only, following the CreativeAssets interface structure.`
}

export function createFlowPrompt(request: FunnelGenerationRequest, strategyContext?: string): string {
  return `Based on the following business requirements${strategyContext ? ' and marketing strategy' : ''}, create a detailed funnel flow and customer journey:

**Business Prompt:** "${request.prompt}"

${request.businessType ? `**Business Type:** ${request.businessType}` : ''}
${request.targetMarket ? `**Target Market:** ${request.targetMarket}` : ''}

${strategyContext ? `**Strategy Context:** ${strategyContext}` : ''}

Create a comprehensive funnel flow that includes:

1. **Stages**: Each stage of the funnel (awareness, interest, consideration, conversion, retention) with:
   - Clear descriptions and objectives
   - Specific touchpoints with content, timing, and triggers
   - Success metrics for each stage
   - Next stage progression logic

2. **Customer Journey**: Detailed journey mapping showing:
   - Customer state and mindset at each phase
   - Interactions and content consumed
   - Channels used and expected outcomes

3. **Conversion Points**: Key conversion points with:
   - Expected conversion rates
   - Optimization strategies
   - Action triggers

Design the flow to be:
- Logical and progressive
- Optimized for conversions
- Measurable and trackable
- Scalable and automatable

Respond with valid JSON only, following the FunnelFlow interface structure.`
}

export function createKPIsPrompt(request: FunnelGenerationRequest, strategyContext?: string, flowContext?: string): string {
  return `Based on the following business requirements${strategyContext ? ', marketing strategy' : ''}${flowContext ? ', and funnel flow' : ''}, create comprehensive KPI metrics and tracking setup:

**Business Prompt:** "${request.prompt}"

${request.businessType ? `**Business Type:** ${request.businessType}` : ''}
${request.budget ? `**Budget:** ${request.budget}` : ''}
${request.timeline ? `**Timeline:** ${request.timeline}` : ''}

${strategyContext ? `**Strategy Context:** ${strategyContext}` : ''}
${flowContext ? `**Flow Context:** ${flowContext}` : ''}

Create detailed KPI metrics including:

1. **Metrics by Category**: Organize metrics into awareness, engagement, conversion, retention, and revenue categories
2. **Metric Details**: For each metric include:
   - Clear description and calculation formula
   - Realistic target values
   - Tracking method and reporting frequency
   - Industry benchmarks (industry average, good, excellent)

3. **Dashboard Setup**: Define primary and secondary metrics for monitoring with alert configurations
4. **Tracking Implementation**: Specify tools, setup requirements, and integrations needed

Ensure all KPIs are:
- SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Aligned with business objectives
- Actionable and trackable
- Industry-appropriate

Respond with valid JSON only, following the KPIMetrics interface structure.`
}

export function createCompleteFunnelPrompt(request: FunnelGenerationRequest): string {
  return `You are tasked with creating a complete, comprehensive marketing funnel based on the following business requirements. Generate all five components in a single, cohesive response:

**Business Prompt:** "${request.prompt}"

${request.businessType ? `**Business Type:** ${request.businessType}` : ''}
${request.targetMarket ? `**Target Market:** ${request.targetMarket}` : ''}
${request.budget ? `**Budget:** ${request.budget}` : ''}
${request.timeline ? `**Timeline:** ${request.timeline}` : ''}

Create a complete funnel including:

1. **Ideal Customer Profile (ICP)**: Detailed demographics, psychographics, pain points, motivations, and behavior
2. **Marketing Strategy**: Objectives, channels, budget allocation, and timeline
3. **Creative Assets**: Ad copy, email sequences, landing page content, and social media content
4. **Funnel Flow**: Stages, customer journey, touchpoints, and conversion points
5. **KPI Metrics**: Comprehensive tracking and measurement framework

Ensure all components are:
- Cohesive and aligned with each other
- Realistic and achievable
- Data-driven and measurable
- Industry-appropriate
- Optimized for conversions

The funnel should be ready for immediate implementation with clear, actionable next steps.

Respond with valid JSON only, following the CompleteFunnel interface structure.`
} 