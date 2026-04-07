import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert File to Buffer/ArrayBuffer for Supabase
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('notes')
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error('Supabase Upload Error:', error);
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'File uploaded successfully', 
      path: data.path 
    });
  } catch (error: any) {
    console.error('API Upload Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
