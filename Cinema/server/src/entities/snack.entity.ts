import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('snacks')
export class Snack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  price: number;

  @Column({ name: 'image_url', length: 255, nullable: true })
  imageUrl: string;

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ default: 100 })
  stock: number;
}
