import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { updateNote, listCategories } from "./api";

function EditNoteModal({ show, onHide, onNoteUpdated, note }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Modal gösterildiğinde ve düzenlenecek not mevcut olduğunda formu doldur
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategoryId(note.category || "");
      setTags(note.tags ? note.tags.join(", ") : "");
    }

    // Kategorileri yükle
    if (show) {
      listCategories()
        .then(setCategories)
        .catch((err) => console.error("Kategoriler yüklenemedi:", err));
    }
  }, [note, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note) return;

    try {
      const updatedPayload = {
        title,
        content,
        category_id: categoryId || null,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      };
      const updatedNote = await updateNote(note.id, updatedPayload);
      onNoteUpdated(updatedNote);
      onHide();
    } catch (error) {
      console.error("Not güncellenirken hata:", error);
      alert(`Not güncellenirken hata oluştu: ${error.message}`);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Notu Düzenle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Başlık</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" style={{ height: "200px" }}>
            <Form.Label>İçerik</Form.Label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              style={{ height: "150px" }}
             />
          </Form.Group>
          <Form.Group>
            <Form.Label>Kategori</Form.Label>
            <Form.Control
              as="select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Kategori Seç</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Etiketler (virgülle ayırın)</Form.Label>
            <Form.Control
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            Güncelle
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditNoteModal;
