"use client";

import type { Schema } from "@/amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Link from 'next/link';
import { useEffect, useState } from "react";

type Todo = {
  id: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Explicitly set the apiKey authorization mode
  const client = generateClient<Schema>({
    authMode: 'apiKey'
  });

  const fetchTodos = async () => {
    try {
      const { data, errors } = await client.models.Todo.list();
      
      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to fetch todos');
      }
      
      if (!data) {
        setTodos([]);
        return;
      }

      const validTodos = data.filter((todo): todo is { id: string; content: string; createdAt: string; updatedAt: string } => 
        todo !== null && typeof todo.content === 'string'
      );
      setTodos(validTodos);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch todos';
      console.error('Error fetching todos:', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Todo List</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Link href="/login" className="text-blue-500 hover:underline mb-4 block">
        Admin Login
      </Link>
      
      {todos.length === 0 ? (
        <p>No todos available</p>
      ) : (
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center border-b pb-2">
              <span>{todo.content}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
