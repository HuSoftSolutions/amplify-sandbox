"use client";

import type { Schema } from "@/amplify/data/resource";
import { setupAuthListener, type AuthStatus } from "@/utils/auth";
import { generateClient } from "aws-amplify/data";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from "react";

type Todo = {
  id: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminDashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoContent, setNewTodoContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const router = useRouter();
  
  // Create the client with userPoolConfig authorization mode
  const client = generateClient<Schema>({
    authMode: 'userPool'
  });

  const fetchTodos = useCallback(async () => {
    try {
      const { data } = await client.models.Todo.list();
      const validTodos = data.filter((todo): todo is { id: string; content: string; createdAt: string; updatedAt: string } => 
        todo !== null && typeof todo.content === 'string'
      );
      setTodos(validTodos);
      setError(null);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    const unsubscribe = setupAuthListener((status) => {
      setAuthStatus(status);
      if (status === 'unauthenticated') {
        router.push('/login');
      } else if (status === 'authenticated') {
        fetchTodos();
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router, fetchTodos]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newTodoContent.trim();
    if (!content) return;
    
    try {
      setError(null);
      const { data, errors } = await client.models.Todo.create({
        content: content
      });
      
      if (errors || !data) {
        console.error('Create operation errors:', errors);
        throw new Error(errors?.[0]?.message || 'Failed to create todo');
      }

      setTodos(currentTodos => [...currentTodos, data]);
      setNewTodoContent("");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create todo';
      console.error('Error creating todo:', error);
      setError(errorMessage);
      
      if (errorMessage.includes('Not Authorized') || errorMessage.includes('Unauthorized')) {
        router.push('/login');
      }
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setError(null);
      const { errors } = await client.models.Todo.delete({ id });
      
      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to delete todo');
      }
      
      setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete todo';
      console.error('Error deleting todo:', error);
      setError(errorMessage);
      
      if (errorMessage.includes('Not Authorized') || errorMessage.includes('Unauthorized')) {
        router.push('/login');
      }
    }
  };

  if (authStatus === 'checking' || loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (authStatus === 'unauthenticated') {
    return null; // Router will handle redirect
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleCreateTodo} className="mb-4">
        <input
          type="text"
          value={newTodoContent}
          onChange={(e) => setNewTodoContent(e.target.value)}
          placeholder="Add a new todo"
          className="border p-2 mr-2 rounded"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={!newTodoContent.trim()}
        >
          Add Todo
        </button>
      </form>
      
      {todos.length === 0 ? (
        <p>No todos available</p>
      ) : (
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center justify-between border-b pb-2">
              <span>{todo.content}</span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
