import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EditableNote } from './DuzenlenebilirNot';


export function NoteList({ notes, setNotes, filteredNotes, activeFilter, onSave, onStartEdit, onDelete, currentUser, isAdmin }) { // isAdmin prop'unu ekledim

  const listToIterate = activeFilter 
    ? filteredNotes 
    : notes; 

  const handleDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    const items = Array.from(notes); 
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    setNotes(items);
  };

  if (!listToIterate) {
      return <p>Notlar yükleniyor...</p>; 
  }

  return (
    <ul className="grid" style={{ marginTop: 0, listStyle: "none", padding: 0 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="notes">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {/* 2. Güvenli Çağrı: map metodu sadece liste var olduğunda çalışır */}
              {listToIterate.map((n, index) => {
                

                return (
                  <Draggable key={n.id} draggableId={n.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <EditableNote 
                        ref={provided.innerRef} 
                        {...provided.draggableProps} 
                        {...provided.dragHandleProps} 
                        note={n} 
                        onSave={onSave} 
                        onStartEdit={onStartEdit} 
                        onDelete={onDelete} 
                        currentUser={currentUser} 
                        isAdmin={isAdmin} 
                        animationDelay={index * 50} 
                        extraClassName={`${snapshot.isDragging ? 'dragging' : ''}`} 
                      />
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ul>
  );
}