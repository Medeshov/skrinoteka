'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { LazyImage } from './LazyImage'
import { FlowModal } from './FlowModal'
import { ChevronRight } from "lucide-react"

interface Screen {
  id: string
  name: string
  image: {
    url: string
  }
  platform: { name: string }[]
  flowType?: {
    name: string
  }
}

interface FlowsViewProps {
  screens: Screen[]
  flowTypes: { name: string }[]
  appName: string
  isDesktop?: boolean
}

const FlowsView = ({ 
  screens, 
  flowTypes, 
  appName,
  isDesktop = false 
}: FlowsViewProps) => {
  const [selectedFlow, setSelectedFlow] = useState<{
    screens: { url: string; id: string }[]
    type: string
  } | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const flow = searchParams.get('flow')
    const screen = searchParams.get('screen')
    
    if (flow) {
      const flowScreens = screens.filter(s => s.flowType?.name === flow)
      if (flowScreens.length > 0) {
        const index = screen ? parseInt(screen) - 1 : 0
        if (index >= 0 && index < flowScreens.length) {
          setSelectedFlow({
            type: flow,
            screens: flowScreens.map((s, i) => ({ 
              url: s.image.url, 
              id: s.id 
            }))
          })
          setCurrentIndex(index)
        }
      }
    }
  }, [searchParams, screens])

  const updateURL = useCallback((flow: string | null, index: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (flow && index !== null) {
      params.set('flow', flow)
      params.set('screen', (index + 1).toString())
    } else {
      params.delete('flow')
      params.delete('screen')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  const handleFlowClick = useCallback((type: string, flowScreens: Screen[], index: number) => {
    setSelectedFlow({ 
      type, 
      screens: flowScreens.map(s => ({ 
        url: s.image.url, 
        id: s.id 
      })) 
    })
    setCurrentIndex(index)
    updateURL(type, index)
  }, [updateURL])

  const handleCloseModal = useCallback(() => {
    setSelectedFlow(null)
    setCurrentIndex(0)
    updateURL(null, null)
  }, [updateURL])

  const handleNext = useCallback(() => {
    if (selectedFlow && currentIndex < selectedFlow.screens.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      updateURL(selectedFlow.type, newIndex)
    }
  }, [selectedFlow, currentIndex, updateURL])

  const handlePrev = useCallback(() => {
    if (selectedFlow && currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      updateURL(selectedFlow.type, newIndex)
    }
  }, [selectedFlow, currentIndex, updateURL])

  const flowGroups = useMemo(() => {
    const groups = flowTypes.map(flowType => {
      const filteredScreens = screens.filter(screen => {
        const matches = screen.flowType?.name === flowType.name && 
                       screen.image?.url && 
                       screen.image.url.trim() !== '';
        return matches;
      });
      
      return {
        type: flowType.name,
        screens: filteredScreens
      };
    });
    
    return groups.filter(group => group.screens.length > 0);
  }, [flowTypes, screens])

  if (!flowTypes || flowTypes.length === 0 || !screens || screens.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-500">Потоки отсутствуют</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-4xl font-semibold text-zinc-900">Потоки</h2>
      <div className="space-y-12">
        {flowGroups.map(group => {
          if (group.screens.length === 0) {
            return null;
          }

          return (
            <div key={`flow-${group.type}`}>
              <div
                className="mb-4 flex items-center justify-between cursor-pointer"
                onClick={() => handleFlowClick(group.type, group.screens, 0)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleFlowClick(group.type, group.screens, 0)
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center group">
                    <h3 className="text-xl font-semibold text-zinc-900">{group.type}</h3>
                    <ChevronRight className="w-5 h-5 text-zinc-400 ml-1 transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
                  </div>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-500">{group.screens.length} экранов</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.screens.map((screen, index) => {
                  if (!screen.image?.url || screen.image.url.trim() === '') return null;

                  return (
                    <div
                      key={`${group.type}-${screen.id}-${index}`}
                      className="relative aspect-[390/844] cursor-pointer group"
                      onClick={() => handleFlowClick(group.type, group.screens, index)}
                      role="listitem"
                      aria-label={`${appName} ${group.type} экран ${index + 1}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleFlowClick(group.type, group.screens, index)
                        }
                      }}
                    >
                      <div className="relative w-full h-full overflow-hidden rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-colors shadow-sm">
                        <LazyImage
                          src={screen.image.url}
                          alt={`${appName} ${group.type} экран ${index + 1}`}
                          className="w-full h-full object-cover object-top"
                          isFirst={index === 0}
                        />
                        <div className="absolute inset-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}

        {selectedFlow && (
          <FlowModal
            isOpen={true}
            onClose={handleCloseModal}
            screens={selectedFlow.screens}
            currentIndex={currentIndex}
            onNext={handleNext}
            onPrev={handlePrev}
            flowType={selectedFlow.type}
            appName={appName}
            platform={isDesktop ? 'desktop' : 'mobile'}
          />
        )}
      </div>
    </div>
  )
}

FlowsView.displayName = 'FlowsView'
export default FlowsView