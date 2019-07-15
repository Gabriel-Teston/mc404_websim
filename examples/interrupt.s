# salva registradores
csrrw a0, mscratch, a0    # salva a0; "seta" a0 = &temp storage
sw a1, 0(a0)              # salva a1
sw a2, 4(a0)              # salva a2
sw a3, 8(a0)              # salva a3
sw a4, 12(a0)             # salva a4
# decodifica a causa da interrupção
csrr a1, mcause           # lê a causa da exceção
bgez a1, exception        # desvia se não for uma interrupção
andi a1, a1, 0x3f         # isola a causa de interrupção
li a2, 7                  # a2 = causa de interrupção do temporizador
bne a1, a2, otherInt      # desvia se não for uma interrupção do timer
# trata a interrupção do temporizador incrementando o comparador de tempo
la a1, mtimecmp           # a1 = &time comparator
lw a2, 0(a1)              # carrega os 32 bits mais em baixo do comparador
lw a3, 4(a1)              # carrega os 32 mais acima do comparador
addi a4, a2, 1000         # incrementa os bits mais baixos em 1000 ciclos
sltu a2, a4, a2           # gera o carry-out
add a3, a3, a2            # incrementa os bits mais acima
sw a3, 4(a1)              # guarda os 32 bits acima
sw a4, 0(a1)              # guarda os 32 bits mais abaixo
# restaura registradores e retorna
lw a4, 12(a0)             # restaura a4
lw a3, 4(a0)              # restaura a3
lw a2, 4(a0)              # restaura a2
lw a1, 0(a0)              # restaura a1
csrrw a0, mscratch, a0 # restaura a0; mscratch = &temp storage
mret # retorna do tratador

__start:
