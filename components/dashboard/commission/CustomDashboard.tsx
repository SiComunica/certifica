'use client'

import * as React from "react"
import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DetailedStats } from "./DetailedStats"
import { ReviewHistory } from "./ReviewHistory"
import { RequestsQueue } from "./RequestsQueue"
import { DataExport } from "./DataExport"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

interface Widget {
  id: string
  title: string
  component: string
  size: 'small' | 'medium' | 'large'
  visible: boolean
}

export function CustomDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem('dashboard-widgets')
    return saved ? JSON.parse(saved) : [
      { id: 'stats', title: 'Statistiche', component: 'DetailedStats', size: 'large', visible: true },
      { id: 'queue', title: 'Coda Richieste', component: 'RequestsQueue', size: 'medium', visible: true },
      { id: 'history', title: 'Storico Revisioni', component: 'ReviewHistory', size: 'medium', visible: true },
      { id: 'export', title: 'Esporta Dati', component: 'DataExport', size: 'small', visible: true }
    ]
  })

  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets))
  }, [widgets])

  const renderWidget = (widget: Widget) => {
    switch (widget.component) {
      case 'DetailedStats':
        return <DetailedStats />
      case 'RequestsQueue':
        return <RequestsQueue requests={[]} />
      case 'ReviewHistory':
        return <ReviewHistory />
      case 'DataExport':
        return <DataExport />
      default:
        return null
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(widgets)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setWidgets(items)
  }

  const toggleWidget = (id: string) => {
    setWidgets(prev =>
      prev.map(w =>
        w.id === id ? { ...w, visible: !w.visible } : w
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Personalizzata</h2>
        <div className="flex space-x-2">
          {widgets.map(widget => (
            <Button
              key={widget.id}
              variant={widget.visible ? "default" : "outline"}
              size="sm"
              onClick={() => toggleWidget(widget.id)}
            >
              {widget.title}
            </Button>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
              }}
            >
              {widgets.filter(w => w.visible).map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-4 ${
                        widget.size === 'large' ? 'col-span-2' :
                        widget.size === 'medium' ? 'col-span-1' :
                        'col-span-1'
                      }`}
                    >
                      <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
                      {renderWidget(widget)}
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
} 