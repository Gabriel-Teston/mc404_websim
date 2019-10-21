.org 0x100
int_handler:
  li s1, 0x2000
  li t1, 'H'
  sb t1, 0(s1)
  li t1, 'i'
  sb t1, 0(s1)
  li t1, '\n'
  sb t1, 0(s1)
  mret

.globl _start
_start:

  la t0, int_handler 
  csrs mtvec, t0


  # Habilita Interrupções Global
  csrr t1, mstatus  
  ori t1, t1, 0x80 
  csrs mstatus, t1


  # Habilita Interrupções Externas
  csrr t1, mie  
  li t2, 0x800
  or t1, t1, t2 
  csrs mie, t1

  # Muda para o Modo de usuário
  csrr t1, mstatus 
  li t2, ~0x1800 
  and t1, t1, t2
  csrs mstatus, t1

  la t0, user 
  csrs mepc, t0


  mret

  li s1, 0x2000
  li t1, 'N'
  sb t1, 0(s1)
  li t1, 'O'
  sb t1, 0(s1)
  li t1, '\n'
  sb t1, 0(s1)

.align 4
user:
  li s1, 0x2000
  li t1, 'U'
  sb t1, 0(s1)
  li t1, 'S'
  sb t1, 0(s1)
  li t1, 'R'
  sb t1, 0(s1)
  li t1, '\n'
  sb t1, 0(s1)

user_loop:
  j user_loop
