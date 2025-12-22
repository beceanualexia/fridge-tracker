import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Connecting with the local data base
const dbPath = path.join(process.cwd(), 'data.json');

// Read
const readData = () => {
  if (!fs.existsSync(dbPath)) return [];
  const fileContent = fs.readFileSync(dbPath, 'utf8');
  if (!fileContent) return [];
  return JSON.parse(fileContent);
};

// Funcție: Scrie datele
const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// 1. GET (returns the list of products):
export async function GET() {
  const products = readData();
  return NextResponse.json(products);
}

// 2. POST function (adds products):
export async function POST(request) {
  const body = await request.json();
  const products = readData();
  
  const newProduct = {
    id: Date.now(),
    name: body.name,
    expiryDate: body.expiryDate
  };

  products.push(newProduct);
  writeData(products);

  return NextResponse.json(newProduct);
}

// 3. DELETE function (deletes products): 
export async function DELETE(request) {
  const body = await request.json();
  let products = readData();
  
  products = products.filter(p => p.id !== body.id);
  writeData(products);
  
  return NextResponse.json({ success: true });
}