import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { EditableNote } from './DuzenlenebilirNot';

// ⚠️ Not: isVisible ve filteredNotes prop'ları muhtemelen filteredNotes prop'unda
// veya notes prop'unda bir karışıklık olduğu için sorun çıkarıyor. 
// Bu düzeltmede, sadece filteredNotes (veya notes) üzerinde dönerek bu sorunu ortadan kaldırıyoruz.

export function NoteList({ notes, setNotes, filteredNotes, activeFilter, onSave, onStartEdit, onDelete, currentUser, isAdmin }) { // isAdmin prop'unu ekledim

  // Listeyi temel notes üzerinden alalım ve filtreleme mantığını basitleştirelim
  // Listeyi temel notes üzerinden alalım ve filtreleme mantığını basitleştirelim
  const listToIterate = activeFilter 
    ? filteredNotes 
    : notes; 
  // Hata çıktınıza göre bu bileşen filteredNotes'u alıyor olmalı.

  const handleDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    // NOT: Yeniden sıralama işlemi temel notes dizisi üzerinde yapılmalı.
    const items = Array.from(notes); 
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    setNotes(items);
  };

  // 1. Önce, listeyi yüklenmeden önce kontrol ediyoruz.
  // Bu kontrol, listToIterate (veya filteredNotes) undefined ise uygulamayı durdurur.
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
                
                // NOT: Eğer filteredNotes ve notes prop'ları farklıysa, 
                // isVisible kontrolü sadece notes.map içinde çalışabilir. 
                // Biz burada listToIterate üzerinde dönüyoruz, bu nedenle ekstra isVisible kontrolüne gerek kalmaz.

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