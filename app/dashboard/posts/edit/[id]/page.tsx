"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Editor from '@/components/posts/BlockNoteEditor'
import { Loader2, ArrowLeft } from "lucide-react"
import { createClient } from '@/utils/supabase/client'

// This is a simplified type for the post data
interface PostData {
  title: string;
  description: string;
  posts: { content: string };
}

export default function EditPostPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [initialContent, setInitialContent] = useState<string | undefined>(undefined);

  const router = useRouter()
  const params = useParams()
  const { id } = params
  const supabase = createClient()

  useEffect(() => {
    const getPost = async () => {
      if (!id) return;

      const { data: post, error } = await supabase
        .from('scientific_outreach')
        .select('title, description, posts(content)')
        .eq('id', id)
        .single();

      if (error || !post) {
        console.error('Error fetching post for editing:', error);
        alert('Failed to load post data. Redirecting to dashboard.');
        router.replace('/dashboard');
        return;
      }
      
      const postData = post as unknown as PostData;
      setTitle(postData.title);
      setDescription(postData.description);
      // The Editor component expects a stringified JSON for initialContent
      const contentJson = JSON.stringify(postData.posts.content);
      setContent(contentJson);
      setInitialContent(contentJson);
      setIsLoading(false);
    };

    getPost();
  }, [id, router, supabase]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !content.trim()) {
      alert('Por favor, preencha todos os campos.');
      return
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: id,
          title: title.trim(),
          description: description.trim(),
          content_json: JSON.parse(content), // Ensure content is sent as a JSON object
        }),
      });

      if (response.ok) {
        alert('Post updated successfully!');
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to update post.'}`);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }
  
  return (
    <div className="relative min-h-screen bg-white">
       <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

       <main className="flex justify-center">
        <div className="w-full max-w-4xl px-8 pt-24 pb-12">
          <Textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            disabled={isSubmitting}
            className="text-5xl font-extrabold border-none shadow-none focus-visible:ring-0 resize-none p-0 tracking-tight"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A captivating description..."
            disabled={isSubmitting}
            className="text-xl text-gray-500 border-none shadow-none focus-visible:ring-0 resize-none h-auto p-0 my-4"
            rows={1}
          />
          <div className="mt-8">
            {initialContent && (
              <Editor
                onChange={setContent}
                initialContent={initialContent}
                editable={!isSubmitting}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 