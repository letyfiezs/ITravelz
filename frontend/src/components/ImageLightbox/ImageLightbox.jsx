import React, { useEffect, useState } from 'react';
import { useLanguage, useAuth } from '../../hooks/useContext';
import { commentService } from '../../services/api';
import styles from './ImageLightbox.module.css';

/**
 * ImageLightbox
 * Fullscreen image viewer with prev/next navigation and a per-image comment
 * thread. Comments are scoped to (contentType, contentId, imageUrl).
 *
 * Props:
 *  - images: string[]        Resolved image URLs (same order as the slideshow)
 *  - startIndex: number      Index to open on
 *  - alt: string
 *  - contentType: string     "Package" | "Destination" | "Festival" | "Itinerary" | "Service"
 *  - contentId: string       Mongo _id of the content item
 *  - onClose: () => void
 */
const ImageLightbox = ({ images, startIndex = 0, alt = 'Image', contentType, contentId, onClose }) => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [index, setIndex] = useState(startIndex);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const count = images.length;
  const currentSrc = images[index];
  const canComment = Boolean(contentType && contentId);

  // Intentionally no effect syncing `index` to `startIndex` after mount —
  // the underlying slideshow keeps auto-advancing in the background while
  // the lightbox is open, and re-syncing on every change would yank the
  // lightbox to whatever image the background carousel lands on.

  useEffect(() => {
    if (!canComment || !currentSrc) return;
    let cancelled = false;
    setLoadingComments(true);
    commentService
      .getForImage(contentType, contentId, currentSrc)
      .then((res) => { if (!cancelled) setComments(res.data.data || []); })
      .catch(() => { if (!cancelled) setComments([]); })
      .finally(() => { if (!cancelled) setLoadingComments(false); });
    return () => { cancelled = true; };
  }, [canComment, contentType, contentId, currentSrc]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, onClose]);

  const prev = (e) => { e.stopPropagation(); setIndex((i) => (i - 1 + count) % count); };
  const next = (e) => { e.stopPropagation(); setIndex((i) => (i + 1) % count); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    setPostError('');
    try {
      const res = await commentService.add(contentType, contentId, {
        imageUrl: currentSrc,
        text: text.trim(),
      });
      setComments((prev) => [res.data.data, ...prev]);
      setText('');
    } catch (err) {
      setPostError(err.response?.data?.message || 'Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('comment_delete_confirm'))) return;
    try {
      await commentService.delete(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      // Non-fatal
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <button className={styles.close} onClick={onClose} aria-label={t('lightbox_close')}>
        <i className="fas fa-times" />
      </button>

      <div className={styles.body} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imgWrap}>
          {count > 1 && (
            <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous">
              <i className="fas fa-chevron-left" />
            </button>
          )}
          <img src={currentSrc} alt={`${alt} ${index + 1}`} className={styles.img} />
          {count > 1 && (
            <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next">
              <i className="fas fa-chevron-right" />
            </button>
          )}
          {count > 1 && <span className={styles.counter}>{index + 1}/{count}</span>}
        </div>

        {canComment && (
          <div className={styles.comments}>
            <h4 className={styles.commentsTitle}>{t('comments_title')}</h4>

            <div className={styles.commentList}>
              {loadingComments ? (
                <p className={styles.empty}>{t('loading')}</p>
              ) : comments.length === 0 ? (
                <p className={styles.empty}>{t('comment_empty')}</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className={styles.comment}>
                    <div className={styles.commentHead}>
                      <span className={styles.commentAuthor}>{c.userName}</span>
                      <span className={styles.commentDate}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      {(user?.id === c.user || user?.role === 'admin') && (
                        <button
                          className={styles.commentDelete}
                          onClick={() => handleDelete(c._id)}
                          aria-label={t('comment_delete')}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      )}
                    </div>
                    <p className={styles.commentText}>{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {isAuthenticated ? (
              <form className={styles.commentForm} onSubmit={handleSubmit}>
                {postError && <p className={styles.postError}>{postError}</p>}
                <textarea
                  className={styles.commentInput}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('comment_placeholder')}
                  maxLength={500}
                  rows={2}
                />
                <button type="submit" className={styles.commentSubmit} disabled={posting || !text.trim()}>
                  {posting ? t('comment_posting') : t('comment_submit')}
                </button>
              </form>
            ) : (
              <p className={styles.loginPrompt}>
                {t('comment_login_prompt')} <a href="/login">{t('comment_login_link')}</a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
