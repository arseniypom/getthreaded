'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, CheckCircle2 } from 'lucide-react'
import { PostTemplate } from '@/lib/strategy-types'

interface PostTemplatesProps {
  templates: PostTemplate[]
  pillars: string[]
}

export function PostTemplates({ templates, pillars }: PostTemplatesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(
    templates.length > 0 ? templates[0] : null
  )

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!templates || templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Post Templates</CardTitle>
          <CardDescription>No templates available yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Post Templates & Examples</CardTitle>
        <CardDescription>
          Ready-to-use templates tailored to your voice and audience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold mb-3">Templates</h3>
            <Tabs
              orientation="vertical"
              value={selectedTemplate?.id}
              onValueChange={(value) => {
                const template = templates.find(t => t.id === value)
                setSelectedTemplate(template || null)
              }}
              className="w-full"
            >
              <TabsList className="flex-col h-auto w-full">
                {templates.map((template) => (
                  <TabsTrigger
                    key={template.id}
                    value={template.id}
                    className="w-full justify-start text-left"
                  >
                    {template.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Template Structure */}
          {selectedTemplate && (
            <>
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Template Structure</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(selectedTemplate.structure, selectedTemplate.id)}
                  >
                    {copiedId === selectedTemplate.id ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">
                      {selectedTemplate.structure}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Examples */}
              <div className="lg:col-span-1">
                <h3 className="font-semibold mb-3">Examples</h3>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {selectedTemplate.examples.map((example, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{example.title}</CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(example.content, `${selectedTemplate.id}-${index}`)}
                            >
                              {copiedId === `${selectedTemplate.id}-${index}` ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <pre className="whitespace-pre-wrap text-sm">
                            {example.content}
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>

        {/* Pillars Reference */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-3">Your Content Pillars</h3>
          <div className="flex flex-wrap gap-2">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-secondary rounded-full text-sm"
              >
                {pillar}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}