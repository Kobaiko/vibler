import type { CompleteStrategy } from '@/types/strategy'
import jsPDF from 'jspdf'

export type ExportFormat = 'pdf' | 'markdown' | 'json' | 'csv'

export class StrategyExporter {
  /**
   * Export strategy to specified format
   */
  static async export(strategy: CompleteStrategy, format: ExportFormat): Promise<void> {
    switch (format) {
      case 'pdf':
        return this.toPDF(strategy)
      case 'markdown':
        return this.toMarkdown(strategy)
      case 'json':
        return this.toJSON(strategy)
      case 'csv':
        return this.toCSV(strategy)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Export strategy to PDF format
   */
  static async toPDF(strategy: CompleteStrategy): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: string = '#000000') => {
      pdf.setFontSize(fontSize)
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
      pdf.setTextColor(color)
      
      const lines = pdf.splitTextToSize(text, contentWidth)
      const lineHeight = fontSize * 0.6 // Increased line height for better spacing
      
      // Check if we need a new page
      if (yPosition + (lines.length * lineHeight) > pageHeight - margin - 20) {
        pdf.addPage()
        yPosition = margin
      }
      
      pdf.text(lines, margin, yPosition)
      yPosition += lines.length * lineHeight + 8 // Increased spacing between text blocks
    }

    // Helper function to add section header
    const addSectionHeader = (title: string) => {
      yPosition += 15 // Increased space before section
      addText(title, 14, true, '#1f2937')
      yPosition += 8 // Increased space after header
    }

    // Title and header
    pdf.setFillColor(59, 130, 246) // Blue background
    pdf.rect(0, 0, pageWidth, 40, 'F')
    
    pdf.setTextColor('#ffffff')
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text(strategy.title || 'Marketing Strategy', margin, 25)
    
    yPosition = 60

    // Strategy Overview
    addSectionHeader('Strategy Overview')
    addText(strategy.description || 'No description provided')

    // Marketing Channels
    if (strategy.channels && strategy.channels.length > 0) {
      addSectionHeader('Marketing Channels')
      strategy.channels.forEach((channel: any) => {
        addText(`${channel.name}`, 12, true)
        addText(`Budget Allocation: ${channel.budgetAllocation}%`)
        addText(`Expected ROI: ${channel.expectedROI}x`)
        addText(`Timeline: ${channel.timeline}`)
        addText(channel.description || '')
        
        if (channel.tactics && channel.tactics.length > 0) {
          addText('Tactics:', 11, true)
          channel.tactics.forEach((tactic: string) => {
            addText(`• ${tactic}`)
          })
        }
        yPosition += 10
      })
    }

    // Messaging Pillars
    if (strategy.messagingPillars && strategy.messagingPillars.length > 0) {
      addSectionHeader('Messaging Pillars')
      strategy.messagingPillars.forEach((pillar: any) => {
        addText(`${pillar.title}`, 12, true)
        addText(pillar.description || '')
        
        if (pillar.keyMessages && pillar.keyMessages.length > 0) {
          addText('Key Messages:', 11, true)
          pillar.keyMessages.forEach((message: string) => {
            addText(`• ${message}`)
          })
        }
        yPosition += 8
      })
    }

    // Timeline
    if (strategy.timeline && strategy.timeline.length > 0) {
      addSectionHeader('Campaign Timeline')
      strategy.timeline.forEach((phase: any) => {
        addText(`${phase.phase}`, 12, true)
        addText(`Duration: ${phase.duration}`)
        addText(phase.description || '')
        
        if (phase.activities && phase.activities.length > 0) {
          addText('Activities:', 11, true)
          phase.activities.forEach((activity: string) => {
            addText(`• ${activity}`)
          })
        }
        yPosition += 8
      })
    }

    // Budget Breakdown
    if (strategy.budget) {
      addSectionHeader('Budget Breakdown')
      if (strategy.budget.totalBudget) {
        addText(`Total Budget: $${strategy.budget.totalBudget.toLocaleString()}`, 12, true)
      }
      
      if (strategy.budget.allocation) {
        addText('Channel Allocation:', 11, true)
        Object.entries(strategy.budget.allocation).forEach(([channel, amount]: [string, any]) => {
          addText(`• ${channel}: $${amount.toLocaleString()}`)
        })
      }
    }

    // Success Metrics
    if (strategy.successMetrics && strategy.successMetrics.length > 0) {
      addSectionHeader('Success Metrics & KPIs')
      strategy.successMetrics.forEach((metric: any) => {
        addText(`${metric.name}`, 12, true)
        addText(`Target: ${metric.target}`)
        addText(`Measurement: ${metric.measurement}`)
        yPosition += 5
      })
    }

    // Recommendations
    if (strategy.recommendations && strategy.recommendations.length > 0) {
      addSectionHeader('Recommendations')
      strategy.recommendations.forEach((rec: any) => {
        addText(`${rec.title}`, 12, true)
        addText(rec.description || '')
        addText(`Priority: ${rec.priority}`)
        yPosition += 8
      })
    }

    // Risk Assessment
    if (strategy.riskAssessment && strategy.riskAssessment.length > 0) {
      addSectionHeader('Risk Assessment')
      strategy.riskAssessment.forEach((risk: any) => {
        addText(`${risk.risk}`, 12, true)
        addText(`Impact: ${risk.impact}`)
        addText(`Mitigation: ${risk.mitigation}`)
        yPosition += 8
      })
    }

    // Footer on all pages
    const totalPages = (pdf as any).internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setTextColor('#6b7280')
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10)
      pdf.text('Generated by Vibler Strategy Composer', margin, pageHeight - 10)
      
      // Add generation date
      const now = new Date()
      pdf.text(`Generated: ${now.toLocaleDateString()}`, margin, pageHeight - 5)
    }

    // Save the PDF
    const fileName = `${strategy.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'strategy'}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
  }

  /**
   * Export strategy to Markdown format
   */
  static async toMarkdown(strategy: CompleteStrategy): Promise<void> {
    let markdown = `# ${strategy.title}\n\n`
    markdown += `${strategy.description}\n\n`
    
    if (strategy.channels && strategy.channels.length > 0) {
      markdown += `## Marketing Channels\n\n`
      strategy.channels.forEach(channel => {
        markdown += `### ${channel.name}\n`
        markdown += `- **Budget Allocation:** ${channel.budgetAllocation}%\n`
        markdown += `- **Expected ROI:** ${channel.expectedROI}x\n`
        markdown += `- **Timeline:** ${channel.timeline}\n`
        if (channel.description) {
          markdown += `- **Description:** ${channel.description}\n`
        }
        if (channel.tactics && channel.tactics.length > 0) {
          markdown += `\n**Tactics:**\n`
          channel.tactics.forEach(tactic => {
            markdown += `- ${tactic}\n`
          })
        }
        markdown += `\n`
      })
    }

    if (strategy.messagingPillars && strategy.messagingPillars.length > 0) {
      markdown += `## Messaging Pillars\n\n`
      strategy.messagingPillars.forEach(pillar => {
        markdown += `### ${pillar.title}\n`
        markdown += `${pillar.description}\n\n`
        markdown += `**Target Audience:** ${pillar.targetAudience}\n\n`
        if (pillar.keyMessages && pillar.keyMessages.length > 0) {
          markdown += `**Key Messages:**\n`
          pillar.keyMessages.forEach(message => {
            markdown += `- ${message}\n`
          })
          markdown += `\n`
        }
      })
    }

    if (strategy.timeline && strategy.timeline.length > 0) {
      markdown += `## Timeline\n\n`
      strategy.timeline.forEach(phase => {
        markdown += `### ${phase.phase}\n`
        markdown += `**Duration:** ${phase.duration}\n`
        markdown += `**Budget:** $${phase.budget.toLocaleString()}\n\n`
        if (phase.objectives && phase.objectives.length > 0) {
          markdown += `**Objectives:**\n`
          phase.objectives.forEach(objective => {
            markdown += `- ${objective}\n`
          })
          markdown += `\n`
        }
        if (phase.activities && phase.activities.length > 0) {
          markdown += `**Activities:**\n`
          phase.activities.forEach(activity => {
            markdown += `- ${activity}\n`
          })
          markdown += `\n`
        }
      })
    }

    if (strategy.budget) {
      markdown += `## Budget\n\n`
      if (strategy.budget.totalBudget) {
        markdown += `**Total Budget:** ${strategy.budget.currency}${strategy.budget.totalBudget.toLocaleString()}\n\n`
      }
      if (strategy.budget.channels) {
        markdown += `**Channel Allocation:**\n`
        Object.entries(strategy.budget.channels).forEach(([channelName, allocation]) => {
          markdown += `- ${channelName}: ${strategy.budget.currency}${allocation.amount.toLocaleString()} (${allocation.percentage}%)\n`
        })
        markdown += `\n`
      }
    }

    if (strategy.successMetrics && strategy.successMetrics.length > 0) {
      markdown += `## Success Metrics\n\n`
      strategy.successMetrics.forEach(metric => {
        markdown += `- ${metric}\n`
      })
      markdown += `\n`
    }

    if (strategy.recommendations && strategy.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`
      strategy.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`
      })
      markdown += `\n`
    }

    if (strategy.riskAssessment && strategy.riskAssessment.length > 0) {
      markdown += `## Risk Assessment\n\n`
      strategy.riskAssessment.forEach(risk => {
        markdown += `- ${risk}\n`
      })
      markdown += `\n`
    }

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${strategy.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_strategy.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Export strategy to JSON format
   */
  static async toJSON(strategy: CompleteStrategy): Promise<void> {
    const jsonString = JSON.stringify(strategy, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${strategy.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_strategy.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Export strategy to CSV format
   */
  static async toCSV(strategy: CompleteStrategy): Promise<void> {
    let csv = 'Section,Item,Details,Value\n'
    
    csv += `"Overview","Title","${strategy.title}",""\n`
    csv += `"Overview","Description","${strategy.description}",""\n`
    
    if (strategy.channels) {
      strategy.channels.forEach(channel => {
        csv += `"Channels","${channel.name}","${channel.description || ''}","${channel.budgetAllocation}%"\n`
      })
    }

    if (strategy.messagingPillars) {
      strategy.messagingPillars.forEach(pillar => {
        csv += `"Messaging","${pillar.title}","${pillar.description}","${pillar.targetAudience}"\n`
      })
    }

    if (strategy.successMetrics) {
      strategy.successMetrics.forEach(metric => {
        csv += `"Metrics","${metric}","",""\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${strategy.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_strategy.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
} 