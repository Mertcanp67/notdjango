import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { createNote, listCategories } from "./api";

function AddNoteModal({ show, onHide, onNoteAdded }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (show) {
      listCategories()
        .then(setCategories)
        .catch((err) => console.error("Kategoriler yüklenemedi:", err));
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newNote = await createNote({
        title,
        content,
        category_id: categoryId || null,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      });
      onNoteAdded(newNote);
      onHide();
      setTitle("");
      setContent("");
      setCategoryId("");
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
          <Form.Group className="mb-3">
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
          <Button variant="primary" type="submit" className="mt-5">
            Ekle
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddNoteModal;
