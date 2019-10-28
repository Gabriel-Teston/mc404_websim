.org 0x100
int_handler:
  li s1, 0xFFFF0108
  li s2, 0xFFFF0109
  li s3, 1
  li t1, 'H'
  sb t1, 0(s2)
  sb s3, 0(s1)
wait1:
  lb t1, 0(s1)
  beq t1, s3, wait1
  li t1, 'i'
  sb t1, 0(s2)
  sb s3, 0(s1)
wait2:
  lb t1, 0(s1)
  beq t1, s3, wait2
  li t1, '\n'
  sb t1, 0(s2)
  sb s3, 0(s1)
wait3:
  lb t1, 0(s1)
  beq t1, s3, wait3
  li s1, 0xFFFF0104
  li s2, 3000
  sw s2, 0(s1)
  mret

.globl _start
_start:

  li s1, 0xFFFF0104
  li s2, 3000
  sw s2, 0(s1)

  la t0, int_handler 
  csrw mtvec, t0


  # Habilita Interrupções Global
  csrr t1, mstatus  
  ori t1, t1, 0x80 
  csrw mstatus, t1


  # Habilita Interrupções Externas
  csrr t1, mie  
  li t2, 0x800
  or t1, t1, t2 
  csrw mie, t1

  # Muda para o Modo de usuário
  csrr t1, mstatus 
  li t2, ~0x1800 
  and t1, t1, t2
  csrw mstatus, t1

  la t0, user 
  csrw mepc, t0


  mret

.align 4
user:

user_loop:
  j user_loop
