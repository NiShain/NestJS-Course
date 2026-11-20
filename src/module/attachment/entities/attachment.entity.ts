import {
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity('attachments')
@Index(['attachable_type', 'attachable_id'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column()
  url: string; 

  @Column()
  file_name: string; 

  @Column()
  file_type: string; 

  @Column({ type: 'int' })
  file_size: number; 

  @Column()
  attachable_type: string; 
  @Column()
  attachable_id: string; 

}