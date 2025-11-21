import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { createNote } from "./api";

function AddNoteModal({ show, onHide, onNoteAdded }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newNote = await createNote({
        title,
        content,
        category,
        tags: tags.split(",").map((tag) => tag.trim()),
      });
      onNoteAdded(newNote);
      onHide();
      setTitle("");
      setContent("");
      setCategory("");
      setTags("");
    } catch (error) {
      console.error("Not eklenirken hata:", error);
      alert(`Not eklenirken hata oluştu: ${error.message}`);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Yeni Not Ekle</Modal.Title>
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
          <Form.Group>
            <Form.Label>İçerik</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Kategori</Form.Label>
            <Form.Control
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
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
            Ekle
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddNoteModal;
