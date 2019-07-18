int_handler:
# salva registradores
csrrw a0, mscratch, a0    # salva a0; "seta" a0 = &temp storage
sw a1, 0(a0)              # salva a1
sw a2, 4(a0)              # salva a2
sw a3, 8(a0)              # salva a3
sw a4, 12(a0)             # salva a4
# decodifica a causa da interrupção
teste:
  add t0, t1, t2; # t0 = t1 + t2
  j teste
# restaura registradores e retorna
lw a4, 12(a0)             # restaura a4
lw a3, 4(a0)              # restaura a3
lw a2, 4(a0)              # restaura a2
lw a1, 0(a0)              # restaura a1
csrrw a0, mscratch, a0 # restaura a0; mscratch = &temp storage
mret # retorna do tratador

.globl main
main:

  la t0, int_handler 
  csrs mtvec, t0

  csrr t1, mstatus  
  ori t1, t1, 0x80 
  csrs mstatus, t1

  csrr t1, mie  
  li t2, 0x800
  or t1, t1, t2 
  csrs mie, t1

  csrr t1, mstatus 
  li t2, ~0x1800 
  and t1, t1, t2
  csrs mstatus, t1

  la t0, user 
  csrs mepc, t0


  mret

user:
  add t0, t1, t2; # t0 = t1 + t2
  j user


data:
