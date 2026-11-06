OPTION _EXPLICIT

' DIVER_QB64_CELL_ENGINE_v06.bas
'
' Refresh-cell engine experiment based on direct CCEMU refresh-RAM evidence.
' The DIVER BASIC arithmetic and literal PLOT byte streams are retained.
' Graphics are stored as an eight-bit 2x4 plot glyph plus one foreground and
' one background colour per 80x48 cell. PLOT 29 ORs ON bits with flag off;
' PLOT 30 XORs ON bits with flag on. No activity-specific graph correction,
' point deletion, blue carve-around, ASCEND regrouping, or join handling is
' present in this build. Stage 18 v03 remains the passed visual reference.
' Stage 18 predictive input now preserves source [3034-3036]: blank or any
' unrecognised answer leaves NA=0 for the displayed default at [1895]. F2 is
' a host-only diagnostic-copy key while a DIVER input prompt owns the keyboard.
' The page erase now retains the CCEMU-confirmed raw blank character byte 160
' (large blank), rather than inventing byte 32 for untouched refresh cells.
'
' Target logical display:
'   80 x 48 character cells
'   160 x 192 graphics blocks (2 x 4 blocks per character cell)
'
' QB64-PE: https://www.qb64phoenix.com/

CONST CC_TEXT_COLS = 80
CONST CC_TEXT_ROWS = 48
CONST CC_GFX_COLS = 160
CONST CC_GFX_ROWS = 192

CONST CC_TEXT_MODE = 0
CONST CC_PLOT_MODE = 1

CONST CC_CELL_TEXT = 0
CONST CC_CELL_GRAPHICS = 1
CONST CC_CELL_LARGE_CONTINUATION = 2

CONST CC_PENDING_NONE = 0
CONST CC_PENDING_CCI = 6
CONST CC_PENDING_CURSOR_X = 301
CONST CC_PENDING_CURSOR_Y = 302
CONST CC_PENDING_ESCAPE = 27

CONST CC_WRITE_HORIZONTAL = 0
CONST CC_WRITE_VERTICAL = 1

' The logical Compucolor graphics block is deliberately rectangular here.
' Four screen pixels across and two down give an 8 x 8 normal character cell.
CONST CC_BLOCK_W = 4
CONST CC_BLOCK_H = 2
CONST CC_DISPLAY_W = CC_GFX_COLS * CC_BLOCK_W
CONST CC_DISPLAY_H = CC_GFX_ROWS * CC_BLOCK_H
CONST CC_PANEL_W = 430
CONST CC_WINDOW_W = CC_DISPLAY_W + CC_PANEL_W
CONST CC_WINDOW_H = 620

TYPE CCStateType
    Mode AS INTEGER
    Pending AS INTEGER
    PendingX AS INTEGER

    PlotSubmode AS INTEGER
    PlotForceData AS INTEGER

    TextColumn AS INTEGER
    TextRow AS INTEGER
    WriteDirection AS INTEGER

    Foreground AS INTEGER
    Background AS INTEGER
    Flag AS INTEGER
    LargeCharacters AS INTEGER
    ColourTarget AS INTEGER

    PointX AS INTEGER
    PointY AS INTEGER
    BarOrigin AS INTEGER
    BarOther AS INTEGER

    SuppressedTextBytes AS LONG
    UnsupportedPlotBytes AS LONG
END TYPE

DECLARE SUB CCInitialise ()
DECLARE SUB CCInitialiseGlyphs ()
DECLARE SUB CCReset ()
DECLARE SUB CCPlotBegin ()
DECLARE SUB CCSend (Value AS INTEGER)
DECLARE SUB CCHandleControl (Value AS INTEGER)
DECLARE SUB CCHandlePending (Value AS INTEGER)
DECLARE SUB CCHandlePlotData (Value AS INTEGER)
DECLARE SUB CCApplyCCI (Value AS INTEGER)
DECLARE SUB CCWriteText (TextValue AS STRING)
DECLARE SUB CCWriteCharacter (CharacterCode AS INTEGER)
DECLARE SUB CCNewLine ()
DECLARE SUB CCClearPage ()
DECLARE SUB CCClearTextCell (Column AS INTEGER, Row AS INTEGER)
DECLARE SUB CCSetGraphicsBlock (X AS INTEGER, Y AS INTEGER)
DECLARE SUB CCClearGraphicsBlock (X AS INTEGER, Y AS INTEGER)
DECLARE SUB CCCaptureWorkCellTrace (TraceIndex AS INTEGER)
DECLARE SUB CCDrawHorizontalBar (X0 AS INTEGER, X1 AS INTEGER, Y AS INTEGER)
DECLARE SUB CCDrawVerticalBar (X AS INTEGER, Y0 AS INTEGER, Y1 AS INTEGER)
DECLARE SUB CCDrawVector (X1 AS INTEGER, Y1 AS INTEGER, X0 AS INTEGER, Y0 AS INTEGER)
DECLARE SUB CCRender ()
DECLARE SUB CCRenderCharacter (Column AS INTEGER, Row AS INTEGER)
DECLARE SUB CCRenderPanel ()
DECLARE SUB DIVERCopyDiagnostics ()
DECLARE FUNCTION DIVERModeLabel$ ()
DECLARE SUB CCAddResult (Description AS STRING, Passed AS INTEGER)
DECLARE SUB CCRunTests ()
DECLARE SUB CCBuildEngineDemonstration ()
DECLARE SUB CCBuildHiddenTitleDemonstration ()
DECLARE SUB CCBuildVisibleTitleDemonstration ()
DECLARE SUB CCBuildPlotDemonstration ()
DECLARE SUB DIVERInteractiveStartup ()
DECLARE SUB DIVERInitialiseScheduler ()
DECLARE SUB DIVERInitialiseDiveTable ()
DECLARE SUB DIVERAdvanceSchedulerTick ()
DECLARE SUB DIVERDispatchDueEvents ()
DECLARE SUB DIVERStartPendingActivity ()
DECLARE SUB DIVEREndCurrentActivity ()
DECLARE SUB DIVERPredictiveActivityPrompt ()
DECLARE SUB DIVERBuildWorkStack ()
DECLARE SUB DIVERPlotCurrentProfileTick ()
DECLARE SUB DIVERPlotCurrentWorkTick (BASIC_LP AS INTEGER, BASIC_LQ AS INTEGER)
DECLARE SUB DIVERGosub6100 ()
DECLARE SUB DIVERGosub6200 ()
DECLARE SUB DIVERGosub6250 ()
DECLARE SUB DIVERGosub6950 ()
DECLARE SUB DIVERGosub6850 ()
DECLARE SUB DIVERWriteBoundTime (BASIC_II AS INTEGER, BASIC_NN AS SINGLE)
DECLARE SUB DIVERDisplayMonitorCell (BASIC_ID AS INTEGER, BASIC_VA AS INTEGER, BASIC_CO AS _
    INTEGER, BASIC_FL AS INTEGER)
DECLARE SUB DIVERWriteVerticalLegend ()
DECLARE SUB DIVERClearInputLine (CharacterCount AS INTEGER)
DECLARE SUB DIVERGosub6600 ()
DECLARE SUB DIVERGosub6700 ()
DECLARE SUB DIVERGosub6750 ()
DECLARE SUB DIVERGosub6800 ()
DECLARE SUB DIVERGosub7500 ()
DECLARE SUB DIVERGosub8000 ()
DECLARE SUB DIVERDisplayDepthTrend (BASIC_VA AS INTEGER, BASIC_FL AS INTEGER)
DECLARE SUB DIVERDisplayAirGauge (BASIC_VA AS INTEGER, BASIC_FL AS INTEGER)
DECLARE FUNCTION DIVERReadInput$ (PromptText AS STRING)
DECLARE SUB CCSend1010 ()
DECLARE SUB CCSendPlot2 (A AS INTEGER, B AS INTEGER)
DECLARE SUB CCSendPlot3 (A AS INTEGER, B AS INTEGER, C AS INTEGER)
DECLARE SUB CCSendPlot4 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER)
DECLARE SUB CCSendPlot6 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, _
    F AS INTEGER)
DECLARE SUB CCSendPlot7 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, _
    F AS INTEGER, G AS INTEGER)
DECLARE FUNCTION CCWrapX% (Value AS INTEGER)
DECLARE FUNCTION CCWrapY% (Value AS INTEGER)
DECLARE FUNCTION CCCountGraphicsBlocks& ()
DECLARE FUNCTION CCTextAt% (Column AS INTEGER, Row AS INTEGER, CharacterCode AS INTEGER)
DECLARE FUNCTION CCTextSlice$ (StartColumn AS INTEGER, Row AS INTEGER, CharacterCount AS INTEGER)
DECLARE FUNCTION CCGraphicsAt% (X AS INTEGER, Y AS INTEGER)

DIM SHARED CCState AS CCStateType

DIM SHARED CCCellKind(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextCode(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextForeground(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextBackground(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextBlink(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextLarge(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextInputScale(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER

DIM SHARED CCPlotGlyph(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCPlotForeground(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCPlotBackground(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCPalette(0 TO 7) AS _UNSIGNED LONG

DIM SHARED CCWindow AS LONG
DIM SHARED CCGlyphRows(32 TO 126, 0 TO 7) AS INTEGER
DIM SHARED CCResultText(1 TO 40) AS STRING
DIM SHARED CCResultPassed(1 TO 40) AS INTEGER
DIM SHARED CCResultCount AS INTEGER
DIM SHARED CCScenario AS STRING
DIM SHARED BASIC_InputActive AS INTEGER
DIM SHARED CCAscendOriginPointsSuppressed AS LONG

DIM SHARED BASIC_WD AS SINGLE
DIM SHARED BASIC_DR AS SINGLE
DIM SHARED BASIC_AR AS SINGLE
DIM SHARED BASIC_AD AS SINGLE
DIM SHARED BASIC_CL AS SINGLE
DIM SHARED BASIC_TK AS SINGLE
DIM SHARED BASIC_IK AS SINGLE
DIM SHARED BASIC_XS AS SINGLE
DIM SHARED BASIC_YS AS SINGLE
DIM SHARED BASIC_TimeMode AS STRING
DIM SHARED BASIC_AY AS SINGLE
DIM SHARED BASIC_LA AS SINGLE

' [1370-1460] Scheduler and activity arrays retain their BASIC dimensions.
DIM SHARED BASIC_PA(8, 5) AS SINGLE
DIM SHARED BASIC_ES(30, 2) AS SINGLE
DIM SHARED BASIC_AL(15, 7) AS SINGLE
DIM SHARED BASIC_DT(21, 7) AS SINGLE
DIM SHARED BASIC_C(7) AS INTEGER
DIM SHARED BASIC_PA_scalar AS INTEGER
DIM SHARED BASIC_ES_scalar AS INTEGER
DIM SHARED BASIC_EP AS INTEGER
DIM SHARED BASIC_AL_scalar AS INTEGER
DIM SHARED BASIC_P AS INTEGER
DIM SHARED BASIC_CK AS INTEGER
DIM SHARED BASIC_AA AS SINGLE
DIM SHARED BASIC_BB AS SINGLE
DIM SHARED BASIC_LM AS INTEGER
DIM SHARED BASIC_NA AS INTEGER
DIM SHARED BASIC_WE AS SINGLE
DIM SHARED BASIC_HT AS SINGLE
DIM SHARED BASIC_D5 AS SINGLE
DIM SHARED BASIC_DX AS SINGLE
DIM SHARED BASIC_E5 AS SINGLE
DIM SHARED BASIC_EX AS SINGLE
DIM SHARED BASIC_WM AS SINGLE
DIM SHARED BASIC_NS AS SINGLE
DIM SHARED BASIC_I6 AS INTEGER
DIM SHARED BASIC_L2 AS INTEGER

' Stage 4 execution and diagnostic state. These do not alter BASIC time.
DIM SHARED BASIC_DiveRunning AS INTEGER
DIM SHARED BASIC_DivePaused AS INTEGER
DIM SHARED BASIC_DescendComplete AS INTEGER
DIM SHARED BASIC_WorkActivated AS INTEGER
DIM SHARED BASIC_WorkStartedThisPass AS INTEGER
DIM SHARED BASIC_PromptAnswered AS INTEGER
DIM SHARED BASIC_BottomTime AS SINGLE
DIM SHARED BASIC_BT AS SINGLE
DIM SHARED BASIC_WorkTickCount AS LONG
DIM SHARED BASIC_WorkDotCount AS LONG
DIM SHARED BASIC_WorkGapCount AS LONG
DIM SHARED BASIC_BandBarCount AS LONG
DIM SHARED BASIC_WorkFragmentCount AS INTEGER
DIM SHARED BASIC_CellTraceGlyph(1 TO 8) AS INTEGER
DIM SHARED BASIC_CellTraceAttribute(1 TO 8) AS INTEGER
DIM SHARED BASIC_AscendTickCount AS LONG
DIM SHARED BASIC_DecompressPassCount AS LONG
DIM SHARED BASIC_DecompressCompleted AS INTEGER
DIM SHARED BASIC_DecompressCompletionCount AS INTEGER
DIM SHARED BASIC_RestPassCount AS LONG
DIM SHARED BASIC_DiveEnded AS INTEGER
DIM SHARED BASIC_TickCount AS LONG
DIM SHARED BASIC_VectorCount AS LONG
DIM SHARED BASIC_LastLP AS INTEGER
DIM SHARED BASIC_LastLQ AS INTEGER
DIM SHARED BASIC_LastMP AS INTEGER
DIM SHARED BASIC_LastMQ AS INTEGER
DIM SHARED BASIC_NextWallTick AS DOUBLE

DIM KeyValue AS LONG
DIM Finished AS INTEGER

CCInitialise
DIVERInteractiveStartup

DO
    IF BASIC_DiveRunning AND NOT BASIC_DivePaused THEN
        IF TIMER(.001) >= BASIC_NextWallTick THEN
            DIVERAdvanceSchedulerTick
            BASIC_NextWallTick = TIMER(.001) + .4
        END IF
    END IF

    CCRender
    _DISPLAY

    KeyValue = _KEYHIT
    SELECT CASE KeyValue
        CASE 114, 82 ' R
            DIVERInteractiveStartup
        CASE 112, 80 ' P
            IF BASIC_DiveRunning THEN BASIC_DivePaused = NOT BASIC_DivePaused
        CASE 32 ' SPACE: execute exactly one source tick.
            IF BASIC_DiveRunning THEN
                DIVERAdvanceSchedulerTick
                BASIC_NextWallTick = TIMER(.001) + .4
            END IF
        CASE 99, 67 ' C: host-only plain-text diagnostic copy.
            DIVERCopyDiagnostics
        CASE 27
            Finished = -1
    END SELECT

    _LIMIT 30
LOOP UNTIL Finished

SYSTEM

' [300-700] Dive-table values, retained in source row/column order.
DIVERDiveTableData:
DATA 232,431,999,999,999,999,999
DATA 137,140,159,179,201,229,270
DATA 96,98,106,116,125,134,144
DATA 72,73,81,88,94,99,105
DATA 57,59,66,71,76,80,84
DATA 46,49,55,60,63,67,70
DATA 38,42,47,51,55,58,999
DATA 32,37,41,45,48,51,999
DATA 27,32,37,40,43,45,999
DATA 23,29,33,36,39,41,999
DATA 20,25,30,33,35,37,999
DATA 18,23,27,30,32,34,999
DATA 16,21,25,28,30,31,999
DATA 14,20,23,26,27,29,999
DATA 12,18,21,24,26,27,999
DATA 11,17,20,22,24,25,999
DATA 10,16,19,21,22,24,999
DATA 9,15,18,20,21,999,999
DATA 8,14,17,18,20,999,999
DATA 8,13,16,17,999,999,999
DATA 7,12,15,17,999,999,999


SUB CCInitialise
    CCWindow = _NEWIMAGE(CC_WINDOW_W, CC_WINDOW_H, 32)
    SCREEN CCWindow
    _DEST CCWindow
    _FONT 8
    _TITLE "DIVER QB64 Refresh-cell engine v06"

    ' Bedstead-derived glyphs are stored in this source as an 8-row bitmap
    ' alphabet. This keeps the terminal renderer self-contained and avoids
    ' any dependency on QB64PE's launch directory or an installed font.
    CCInitialiseGlyphs

    ' Compucolor colour indices 0..7: black, red, green, yellow,
    ' blue, magenta, cyan and white.
    CCPalette(0) = _RGB32(5, 5, 5)
    CCPalette(1) = _RGB32(255, 51, 51)
    CCPalette(2) = _RGB32(0, 204, 0)
    CCPalette(3) = _RGB32(204, 204, 0)
    CCPalette(4) = _RGB32(0, 51, 170)
    CCPalette(5) = _RGB32(204, 0, 204)
    CCPalette(6) = _RGB32(0, 200, 184)
    CCPalette(7) = _RGB32(221, 221, 221)

    CCReset
END SUB


SUB CCInitialiseGlyphs
    DIM GlyphData AS STRING
    DIM CharacterCode AS INTEGER
    DIM Row AS INTEGER
    DIM Offset AS LONG

    ' ASCII 32..126, eight hexadecimal row bytes per character. Bedstead
    ' Regular is rasterised at the browser reconstruction's effective scale,
    ' then fitted to the terminal's eight-pixel character cell. This preserves
    ' the established glyph proportions rather than leaving a 5x7 image in
    ' the middle of an 8x8 cell.
    GlyphData = GlyphData + "00000000000000001818181818181800343434000000000034347E347E34"
    GlyphData = GlyphData + "34003C7E783C1A5A3C0070720C1830660600307878307A6E3A0018181800"
    GlyphData = GlyphData + "00000000"
    GlyphData = GlyphData + "040C30303018040030180404040C3000185A3C183C7E18000018187E1818"
    GlyphData = GlyphData + "000000000000000018300000003C00000000000000000000180000020C18"
    GlyphData = GlyphData + "30200000"
    GlyphData = GlyphData + "183C6262626618001838181818183C003C66061C30607E007E02041C0242"
    GlyphData = GlyphData + "3C00041C24647E0404007E607C0602023C001C30607C66623C007E020C18"
    GlyphData = GlyphData + "30303000"
    GlyphData = GlyphData + "3C66663E66623C003C66623E020638000000180000001800000018000000"
    GlyphData = GlyphData + "1830040C30603018040000007E007E00000030180606060C30003C660C08"
    GlyphData = GlyphData + "18001800"
    GlyphData = GlyphData + "3C667E7A7E603C00183C62627E6262007C66667E66627C003C6660606062"
    GlyphData = GlyphData + "3C007C66626262627C007E60607C60607E007E60607C606060003C666060"
    GlyphData = GlyphData + "66623E00"
    GlyphData = GlyphData + "6262627E626262003C18181818183C000202020202023C0062667870786C"
    GlyphData = GlyphData + "62006060606060607E00627E7A7A626262006262727A6E6262003C666262"
    GlyphData = GlyphData + "62623C00"
    GlyphData = GlyphData + "7C66667C606060003C6662627A6E3A007C66667C786C62003C66603C0242"
    GlyphData = GlyphData + "3C007E181818181818006262626262623C0062626634341C18006262627A"
    GlyphData = GlyphData + "7A7A3C00"
    GlyphData = GlyphData + "62623C183C66620062623C18181818007E020C1830607E003E3030303030"
    GlyphData = GlyphData + "3E00006030180C0600007C04040404047C00183C62000000000000000000"
    GlyphData = GlyphData + "00007E00"
    GlyphData = GlyphData + "301804000000000000003C063E623E0060607C6662627C0000003E606060"
    GlyphData = GlyphData + "3E0002023E6262623E0000003C667E603C00040C183C1818180000003E62"
    GlyphData = GlyphData + "62623E02"
    GlyphData = GlyphData + "60607C66626262001800381818183C001800181818181818303032363C38"
    GlyphData = GlyphData + "32003818181818183C0000007C7E7A7A7A0000007C666262620000003C66"
    GlyphData = GlyphData + "62623C00"
    GlyphData = GlyphData + "00007C6662627C6000003E6262623E020000363C3030300000003E603C06"
    GlyphData = GlyphData + "7C0018183C18181804000000626262623E00000062626634180000006262"
    GlyphData = GlyphData + "7A7A3400"
    GlyphData = GlyphData + "000062361C1C62000000626262623E0200007E0C0C187E00060C18301818"
    GlyphData = GlyphData + "060018181818181818007018080C08187000307A040000000000"

    FOR CharacterCode = 32 TO 126
        FOR Row = 0 TO 7
            Offset = ((CharacterCode - 32) * 8 + Row) * 2 + 1
            CCGlyphRows(CharacterCode, Row) = VAL("&H" + MID$(GlyphData, Offset, 2))
        NEXT Row
    NEXT CharacterCode
END SUB


SUB CCReset
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM X AS INTEGER
    DIM Y AS INTEGER

    CCState.Mode = CC_TEXT_MODE
    CCState.Pending = CC_PENDING_NONE
    CCState.PendingX = 0
    CCState.PlotSubmode = 253
    CCState.PlotForceData = 0
    CCState.TextColumn = 0
    CCState.TextRow = 0
    CCState.WriteDirection = CC_WRITE_HORIZONTAL
    CCState.Foreground = 7
    CCState.Background = 0
    CCState.Flag = 0
    CCState.LargeCharacters = 0
    CCState.ColourTarget = 0
    CCState.PointX = 0
    CCState.PointY = 0
    CCState.BarOrigin = 0
    CCState.BarOther = 0
    CCState.SuppressedTextBytes = 0
    CCState.UnsupportedPlotBytes = 0
    CCAscendOriginPointsSuppressed = 0

    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            CCCellKind(Column, Row) = CC_CELL_TEXT
            CCTextCode(Column, Row) = 32
            CCTextForeground(Column, Row) = CCState.Foreground
            CCTextBackground(Column, Row) = CCState.Background
            CCTextBlink(Column, Row) = 0
            CCTextLarge(Column, Row) = 0
            CCTextInputScale(Column, Row) = 0
            CCPlotGlyph(Column, Row) = 0
            CCPlotForeground(Column, Row) = CCState.Foreground
            CCPlotBackground(Column, Row) = CCState.Background
        NEXT Column
    NEXT Row
END SUB


SUB CCPlotBegin
    ' Marks a BASIC PLOT-statement boundary. The real terminal receives a
    ' continuous byte stream, but DIVER also sends ordinary terminal controls
    ' at statement boundaries while Graphic Plot Mode remains active.
    '
    ' Plot submode state and partially supplied arguments are not reset.
END SUB


SUB CCSend (Value AS INTEGER)
    DIM IsPlotSubmode AS INTEGER

    Value = Value AND 255

    IF CCState.Pending <> CC_PENDING_NONE THEN
        CCHandlePending Value
        EXIT SUB
    END IF

    ' Codes 29 and 30 leave a colour field selected. The following colour
    ' value is data even though values 16..23 are below printable ASCII.
    IF CCState.ColourTarget <> 0 THEN
        IF Value >= 16 AND Value <= 23 THEN
            IF CCState.ColourTarget = 1 THEN
                CCState.Foreground = Value AND 7
            ELSE
                CCState.Background = Value AND 7
            END IF
            CCState.ColourTarget = 0
            EXIT SUB
        END IF

        ' [6590] ends with a lone PLOT 29. The following [6591] statement
        ' begins PLOT 2,253,X3,Y3,255; its point-mode byte cancels the
        ' incomplete colour selection. Without this cancellation, X3 values
        ' 16..23 are later consumed as colours instead of coordinates.
        CCState.ColourTarget = 0
    END IF

    IF CCState.Mode = CC_PLOT_MODE THEN
        IF Value = 255 THEN
            CCState.Mode = CC_TEXT_MODE
            CCState.PlotSubmode = 253
            CCState.PlotForceData = 0
            EXIT SUB
        END IF

        IsPlotSubmode = (Value >= 240 AND Value <= 254)
        IF IsPlotSubmode THEN
            CCState.PlotSubmode = Value
            CCState.PlotForceData = -1
            EXIT SUB
        END IF

        ' Once a plot submode has requested a coordinate, all values in the
        ' documented coordinate range are data, including control-code values.
        IF CCState.PlotForceData THEN
            CCHandlePlotData Value
            EXIT SUB
        END IF

        ' These controls are used by DIVER while Plot Mode remains active.
        SELECT CASE Value
            CASE 2, 3, 6, 8, 12, 14, 15, 27, 29, 30, 31
                CCHandleControl Value
            CASE ELSE
                CCHandlePlotData Value
        END SELECT
        EXIT SUB
    END IF

    SELECT CASE Value
        CASE 2, 3, 6, 8, 12, 14, 15, 27, 29, 30, 31
            CCHandleControl Value
        CASE 7
            BEEP
        CASE 32 TO 126
            CCWriteCharacter Value
        CASE ELSE
            ' Other terminal bytes are outside the present DIVER subset.
    END SELECT
END SUB


SUB CCHandleControl (Value AS INTEGER)
    SELECT CASE Value
        CASE 2
            CCState.Mode = CC_PLOT_MODE
            CCState.PlotSubmode = 253
            CCState.PlotForceData = -1

        CASE 3
            CCState.Pending = CC_PENDING_CURSOR_X

        CASE 6
            CCState.Pending = CC_PENDING_CCI

        CASE 8
            CCState.TextColumn = 0
            CCState.TextRow = 0

        CASE 12
            CCClearPage

        CASE 14
            CCState.LargeCharacters = -1

        CASE 15
            CCState.LargeCharacters = 0
            CCState.Flag = 0

        CASE 27
            CCState.Pending = CC_PENDING_ESCAPE

        CASE 29
            ' FG ON / FLAG OFF: OR subsequently plotted ON bits.
            CCState.Flag = 0
            CCState.ColourTarget = 1

        CASE 30
            ' BG ON / FLAG ON: XOR subsequently plotted ON bits.
            CCState.Flag = -1
            CCState.ColourTarget = 2

        CASE 31
            CCState.Flag = -1
    END SELECT
END SUB


SUB CCHandlePending (Value AS INTEGER)
    SELECT CASE CCState.Pending
        CASE CC_PENDING_CCI
            CCApplyCCI Value
            CCState.Pending = CC_PENDING_NONE

        CASE CC_PENDING_CURSOR_X
            CCState.PendingX = Value
            CCState.Pending = CC_PENDING_CURSOR_Y

        CASE CC_PENDING_CURSOR_Y
            CCState.TextColumn = CCState.PendingX
            CCState.TextRow = Value
            CCState.Pending = CC_PENDING_NONE

        CASE CC_PENDING_ESCAPE
            SELECT CASE Value
                CASE 10
                    CCState.WriteDirection = CC_WRITE_VERTICAL
                CASE 11
                    CCState.WriteDirection = CC_WRITE_HORIZONTAL
            END SELECT
            CCState.Pending = CC_PENDING_NONE
    END SELECT
END SUB


SUB CCApplyCCI (Value AS INTEGER)
    ' CCI status bytes hold foreground in bits 0..2, background in bits 3..5
    ' and the Flag/blink bit in bit 6. Code 14 controls double-height output.
    CCState.Foreground = Value AND 7
    CCState.Background = (Value \ 8) AND 7
    CCState.Flag = ((Value AND 64) <> 0)
    CCState.ColourTarget = 0
END SUB


SUB CCHandlePlotData (Value AS INTEGER)
    ' Submode transitions follow the terminal manual. Codes 253/252 define
    ' an X,Y point. 250/249/248 draw repeated horizontal bars. 246/245/244
    ' draw repeated vertical bars. 242/241 draw vectors from the point last
    ' established by Point Plot to each new vector endpoint.
    SELECT CASE CCState.PlotSubmode
        CASE 253 ' X Point Plot
            CCState.PointX = CCWrapX%(Value)
            CCState.PlotSubmode = 252
            CCState.PlotForceData = -1

        CASE 252 ' Y Point Plot
            CCState.PointY = CCWrapY%(Value)
            CCSetGraphicsBlock CCState.PointX, CCState.PointY
            CCState.PlotSubmode = 253
            CCState.PlotForceData = 0

        CASE 250 ' X Bar Graph, X0
            CCState.BarOrigin = CCWrapX%(Value)
            CCState.PlotSubmode = 249
            CCState.PlotForceData = -1

        CASE 249 ' X Bar Graph, Y
            CCState.BarOther = CCWrapY%(Value)
            CCState.PlotSubmode = 248
            CCState.PlotForceData = -1

        CASE 248 ' X Bar Graph, X Max
            CCDrawHorizontalBar CCState.BarOrigin, CCWrapX%(Value), CCState.BarOther
            CCState.PlotSubmode = 249
            CCState.PlotForceData = -1

        CASE 246 ' Y Bar Graph, Y0
            CCState.BarOrigin = CCWrapY%(Value)
            CCState.PlotSubmode = 245
            CCState.PlotForceData = -1

        CASE 245 ' Y Bar Graph, X
            CCState.BarOther = CCWrapX%(Value)
            CCState.PlotSubmode = 244
            CCState.PlotForceData = -1

        CASE 244 ' Y Bar Graph, Y Max
            CCDrawVerticalBar CCState.BarOther, CCState.BarOrigin, CCWrapY%(Value)
            CCState.PlotSubmode = 245
            CCState.PlotForceData = -1

        CASE 242 ' Vector Mode, X0
            CCState.BarOrigin = CCWrapX%(Value)
            CCState.PlotSubmode = 241
            CCState.PlotForceData = -1

        CASE 241 ' Vector Mode, Y0
            CCDrawVector CCState.PointX, CCState.PointY, CCState.BarOrigin, CCWrapY%(Value)
            CCState.PointX = CCState.BarOrigin
            CCState.PointY = CCWrapY%(Value)
            CCState.PlotSubmode = 242
            CCState.PlotForceData = -1

        CASE ELSE
            CCState.UnsupportedPlotBytes = CCState.UnsupportedPlotBytes + 1
            CCState.PlotForceData = 0
    END SELECT
END SUB


FUNCTION CCWrapX% (Value AS INTEGER)
    DIM Result AS INTEGER

    Result = Value MOD CC_GFX_COLS
    IF Result < 0 THEN Result = Result + CC_GFX_COLS
    CCWrapX% = Result
END FUNCTION


FUNCTION CCWrapY% (Value AS INTEGER)
    DIM Result AS INTEGER

    Result = Value MOD CC_GFX_ROWS
    IF Result < 0 THEN Result = Result + CC_GFX_ROWS
    CCWrapY% = Result
END FUNCTION


SUB CCWriteText (TextValue AS STRING)
    DIM Index AS INTEGER

    IF CCState.Mode = CC_PLOT_MODE THEN
        ' Verified DIVER behaviour: ordinary PRINT text is not displayed while
        ' Graphic Plot Mode remains active. This reconstruction records those bytes rather than
        ' inventing unverified raster marks for printable characters.
        CCState.SuppressedTextBytes = CCState.SuppressedTextBytes + LEN(TextValue)
        EXIT SUB
    END IF

    FOR Index = 1 TO LEN(TextValue)
        CCWriteCharacter ASC(MID$(TextValue, Index, 1))
    NEXT Index
END SUB


SUB CCWriteCharacter (CharacterCode AS INTEGER)
    DIM Column AS INTEGER
    DIM Row AS INTEGER

    ' Codes 16..23 following 29 or 30 select one of the eight colours.
    IF CCState.ColourTarget <> 0 AND CharacterCode >= 16 AND CharacterCode <= 23 THEN
        IF CCState.ColourTarget = 1 THEN
            CCState.Foreground = CharacterCode AND 7
        ELSE
            CCState.Background = CharacterCode AND 7
        END IF
        CCState.ColourTarget = 0
        EXIT SUB
    END IF

    Column = CCState.TextColumn
    Row = CCState.TextRow

    ' Column 80 is deliberately used by DIVER to move the cursor off-screen.
    IF Column >= 0 AND Column < CC_TEXT_COLS AND Row >= 0 AND Row < CC_TEXT_ROWS THEN
        CCClearTextCell Column, Row
        CCCellKind(Column, Row) = CC_CELL_TEXT
        CCTextCode(Column, Row) = CharacterCode
        CCTextForeground(Column, Row) = CCState.Foreground
        CCTextBackground(Column, Row) = CCState.Background
        CCTextBlink(Column, Row) = CCState.Flag
        CCTextLarge(Column, Row) = CCState.LargeCharacters
        CCTextInputScale(Column, Row) = BASIC_InputActive

        IF CCState.LargeCharacters AND Row < CC_TEXT_ROWS - 1 THEN
            CCClearTextCell Column, Row + 1
            CCCellKind(Column, Row + 1) = CC_CELL_LARGE_CONTINUATION
            CCTextBackground(Column, Row + 1) = CCState.Background
            CCTextInputScale(Column, Row + 1) = 0
        END IF
    END IF

    IF CCState.WriteDirection = CC_WRITE_VERTICAL THEN
        ' CCEMU confirms that vertical writing advances by the full character
        ' height: one row normally and two rows while LARGE is active.
        IF CCState.LargeCharacters THEN
            CCState.TextRow = CCState.TextRow + 2
        ELSE
            CCState.TextRow = CCState.TextRow + 1
        END IF
    ELSE
        CCState.TextColumn = CCState.TextColumn + 1
    END IF
END SUB


SUB CCNewLine
    IF CCState.LargeCharacters THEN
        CCState.TextRow = CCState.TextRow + 2
    ELSE
        CCState.TextRow = CCState.TextRow + 1
    END IF
    CCState.TextColumn = 0
END SUB


SUB CCClearPage
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM X AS INTEGER
    DIM Y AS INTEGER

    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            CCCellKind(Column, Row) = CC_CELL_TEXT
            CCTextCode(Column, Row) = 32
            CCTextForeground(Column, Row) = CCState.Foreground
            CCTextBackground(Column, Row) = CCState.Background
            CCTextBlink(Column, Row) = 0
            ' Direct refresh-RAM evidence after [1010] shows an untouched
            ' erased cell as CH/AT 160/39. Character 160 is the large form
            ' of blank 32, so retain its high bit until the cell is written.
            CCTextLarge(Column, Row) = -1
            CCTextInputScale(Column, Row) = 0
            CCPlotGlyph(Column, Row) = 0
            CCPlotForeground(Column, Row) = CCState.Foreground
            CCPlotBackground(Column, Row) = CCState.Background
        NEXT Column
    NEXT Row

    CCState.TextColumn = 0
    CCState.TextRow = 0
END SUB


SUB CCClearTextCell (Column AS INTEGER, Row AS INTEGER)
    DIM X AS INTEGER
    DIM Y AS INTEGER
    DIM FirstGraphicsY AS INTEGER

    IF Column < 0 OR Column >= CC_TEXT_COLS THEN EXIT SUB
    IF Row < 0 OR Row >= CC_TEXT_ROWS THEN EXIT SUB
    CCTextInputScale(Column, Row) = 0
    CCPlotGlyph(Column, Row) = 0
    CCPlotForeground(Column, Row) = CCState.Foreground
    CCPlotBackground(Column, Row) = CCState.Background
END SUB


SUB CCSetGraphicsBlock (X AS INTEGER, Y AS INTEGER)
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM BitNumber AS INTEGER
    DIM BitMask AS INTEGER

    X = CCWrapX%(X)
    Y = CCWrapY%(Y)

    Column = X \ 2
    Row = CC_TEXT_ROWS - 1 - (Y \ 4)
    BitNumber = 3 - (Y MOD 4) + 4 * (X MOD 2)
    BitMask = 2 ^ BitNumber

    ' A physical refresh cell has one shared character byte. Its previous
    ' text character is not a hidden plot bitmap: the first plot write
    ' converts the cell and starts a fresh plot glyph. The CCEMU trace of
    ' [6591] at X32 records exactly this conversion, CH/AT 160/39 -> 8/160.
    IF CCCellKind(Column, Row) <> CC_CELL_GRAPHICS THEN
        CCPlotGlyph(Column, Row) = 0
    END IF

    IF CCState.Flag THEN
        CCPlotGlyph(Column, Row) = CCPlotGlyph(Column, Row) XOR BitMask
    ELSE
        CCPlotGlyph(Column, Row) = CCPlotGlyph(Column, Row) OR BitMask
    END IF

    IF Column >= 0 AND Column < CC_TEXT_COLS AND Row >= 0 AND Row < CC_TEXT_ROWS THEN
        CCCellKind(Column, Row) = CC_CELL_GRAPHICS
        CCTextCode(Column, Row) = 32
        CCPlotForeground(Column, Row) = CCState.Foreground
        CCPlotBackground(Column, Row) = CCState.Background
        CCTextBackground(Column, Row) = CCState.Background
    END IF
END SUB


SUB CCCaptureWorkCellTrace (TraceIndex AS INTEGER)
    DIM Column AS INTEGER
    DIM Row AS INTEGER

    IF TraceIndex < 1 OR TraceIndex > 8 THEN EXIT SUB
    Column = 16
    Row = CC_TEXT_ROWS - 1 - (60 \ 4)

    IF CCCellKind(Column, Row) = CC_CELL_GRAPHICS THEN
        BASIC_CellTraceGlyph(TraceIndex) = CCPlotGlyph(Column, Row)
        BASIC_CellTraceAttribute(TraceIndex) = 128 + 8 * CCPlotBackground(Column, Row) + _
            CCPlotForeground(Column, Row)
    ELSE
        ' The trace needs the physical pre-conversion text byte as well. The
        ' current terminal model stores the text character independently.
        BASIC_CellTraceGlyph(TraceIndex) = CCTextCode(Column, Row)
        IF CCTextLarge(Column, Row) THEN BASIC_CellTraceGlyph(TraceIndex) = _
            BASIC_CellTraceGlyph(TraceIndex) + 128
        BASIC_CellTraceAttribute(TraceIndex) = 8 * CCTextBackground(Column, Row) + _
            CCTextForeground(Column, Row)
        IF CCTextBlink(Column, Row) THEN BASIC_CellTraceAttribute(TraceIndex) = _
            BASIC_CellTraceAttribute(TraceIndex) + 64
    END IF
END SUB


SUB CCClearGraphicsBlock (X AS INTEGER, Y AS INTEGER)
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM BitNumber AS INTEGER
    DIM BitMask AS INTEGER

    X = CCWrapX%(X)
    Y = CCWrapY%(Y)
    Column = X \ 2
    Row = CC_TEXT_ROWS - 1 - (Y \ 4)
    BitNumber = 3 - (Y MOD 4) + 4 * (X MOD 2)
    BitMask = 2 ^ BitNumber
    IF (CCPlotGlyph(Column, Row) AND BitMask) <> 0 THEN
        CCPlotGlyph(Column, Row) = CCPlotGlyph(Column, Row) XOR BitMask
    END IF
END SUB


SUB CCDrawHorizontalBar (X0 AS INTEGER, X1 AS INTEGER, Y AS INTEGER)
    DIM X AS INTEGER
    DIM StepValue AS INTEGER

    IF X1 >= X0 THEN StepValue = 1 ELSE StepValue = -1
    X = X0
    DO
        CCSetGraphicsBlock X, Y
        IF X = X1 THEN EXIT DO
        X = X + StepValue
    LOOP
END SUB


SUB CCDrawVerticalBar (X AS INTEGER, Y0 AS INTEGER, Y1 AS INTEGER)
    DIM Y AS INTEGER
    DIM StepValue AS INTEGER

    IF Y1 >= Y0 THEN StepValue = 1 ELSE StepValue = -1
    Y = Y0
    DO
        CCSetGraphicsBlock X, Y
        IF Y = Y1 THEN EXIT DO
        Y = Y + StepValue
    LOOP
END SUB


SUB CCDrawVector (X1 AS INTEGER, Y1 AS INTEGER, X0 AS INTEGER, Y0 AS INTEGER)
    DIM X AS INTEGER
    DIM Y AS INTEGER
    DIM DeltaX AS INTEGER
    DIM DeltaY AS INTEGER
    DIM StepX AS INTEGER
    DIM StepY AS INTEGER
    DIM ErrorValue AS INTEGER
    DIM TwiceError AS INTEGER

    ' Integer best-fit raster line. This is the sole vector rasteriser; it has
    ' no knowledge of DIVER activities or graph joins.
    X = X1
    Y = Y1
    DeltaX = ABS(X0 - X1)
    DeltaY = -ABS(Y0 - Y1)
    IF X1 < X0 THEN StepX = 1 ELSE StepX = -1
    IF Y1 < Y0 THEN StepY = 1 ELSE StepY = -1
    ErrorValue = DeltaX + DeltaY

    DO
        CCSetGraphicsBlock X, Y
        IF X = X0 AND Y = Y0 THEN EXIT DO

        TwiceError = 2 * ErrorValue
        IF TwiceError >= DeltaY THEN
            ErrorValue = ErrorValue + DeltaY
            X = X + StepX
        END IF
        IF TwiceError <= DeltaX THEN
            ErrorValue = ErrorValue + DeltaX
            Y = Y + StepY
        END IF
    LOOP
END SUB


SUB CCRender
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM X AS INTEGER
    DIM Y AS INTEGER
    DIM ScreenX AS INTEGER
    DIM ScreenY AS INTEGER
    DIM BackgroundIndex AS INTEGER
    DIM PlotX AS INTEGER
    DIM PlotY AS INTEGER
    DIM BitNumber AS INTEGER
    DIM BitMask AS INTEGER
    DIM PlotColour AS INTEGER

    _DEST CCWindow
    CLS , _RGB32(24, 24, 24)

    ' Character-cell backgrounds.
    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            BackgroundIndex = CCTextBackground(Column, Row)
            ScreenX = Column * 2 * CC_BLOCK_W
            ScreenY = Row * 4 * CC_BLOCK_H
            LINE (ScreenX, ScreenY)-(ScreenX + 2 * CC_BLOCK_W - 1, ScreenY + 4 * CC_BLOCK_H - _
                1), CCPalette(BackgroundIndex), BF
        NEXT Column
    NEXT Row

    ' Render each graphics cell from its eight-bit 2x4 plot glyph and its
    ' shared foreground/background attributes.
    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            IF CCCellKind(Column, Row) = CC_CELL_GRAPHICS THEN
                FOR PlotY = 0 TO 3
                    FOR PlotX = 0 TO 1
                        BitNumber = PlotY + 4 * PlotX
                        BitMask = 2 ^ BitNumber
                        IF (CCPlotGlyph(Column, Row) AND BitMask) <> 0 THEN
                            PlotColour = CCPlotForeground(Column, Row)
                        ELSE
                            PlotColour = CCPlotBackground(Column, Row)
                        END IF
                        ScreenX = (Column * 2 + PlotX) * CC_BLOCK_W
                        ScreenY = (Row * 4 + PlotY) * CC_BLOCK_H
                        LINE (ScreenX, ScreenY)-(ScreenX + CC_BLOCK_W - 1, ScreenY + CC_BLOCK_H _
                            - 1), CCPalette(PlotColour), BF
                    NEXT PlotX
                NEXT PlotY
            END IF
        NEXT Column
    NEXT Row

    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            IF CCCellKind(Column, Row) = CC_CELL_TEXT AND CCTextCode(Column, Row) <> 32 THEN
                CCRenderCharacter Column, Row
            END IF
        NEXT Column
    NEXT Row

    CCRenderPanel
END SUB


SUB CCRenderCharacter (Column AS INTEGER, Row AS INTEGER)
    DIM ScreenX AS INTEGER
    DIM ScreenY AS INTEGER
    DIM ShowCharacter AS INTEGER
    DIM CharacterCode AS INTEGER
    DIM GlyphRow AS INTEGER
    DIM GlyphColumn AS INTEGER
    DIM RowBits AS INTEGER
    DIM TargetHeight AS INTEGER
    DIM DrawY0 AS INTEGER
    DIM DrawY1 AS INTEGER

    ShowCharacter = -1
    IF CCTextBlink(Column, Row) THEN
        IF (INT(TIMER(.001) * 2) MOD 2) = 0 THEN
            ShowCharacter = -1
        ELSE
            ShowCharacter = 0
        END IF
    END IF
    IF NOT ShowCharacter THEN EXIT SUB

    ScreenX = Column * 2 * CC_BLOCK_W
    ScreenY = Row * 4 * CC_BLOCK_H

    CharacterCode = CCTextCode(Column, Row)
    IF CharacterCode < 32 OR CharacterCode > 126 THEN CharacterCode = 63
    IF CCTextInputScale(Column, Row) THEN
        TargetHeight = 13
    ELSEIF CCTextLarge(Column, Row) THEN
        TargetHeight = 16
    ELSE
        TargetHeight = 8
    END IF

    ' Draw the embedded Bedstead bitmap directly into the terminal cell.
    ' LARGE doubles the terminal character height. Input text uses the
    ' browser reconstruction's equivalent 13-pixel presentation height while
    ' retaining the source's ordinary, non-LARGE character state.
    FOR GlyphRow = 0 TO 7
        RowBits = CCGlyphRows(CharacterCode, GlyphRow)
        DrawY0 = (GlyphRow * TargetHeight) \ 8
        DrawY1 = ((GlyphRow + 1) * TargetHeight) \ 8 - 1
        FOR GlyphColumn = 0 TO 7
            IF (RowBits AND (2 ^ (7 - GlyphColumn))) <> 0 THEN
                LINE (ScreenX + GlyphColumn, ScreenY + DrawY0)-(ScreenX + GlyphColumn, ScreenY _
                    + DrawY1), CCPalette(CCTextForeground(Column, Row)), BF
            END IF
        NEXT GlyphColumn
    NEXT GlyphRow
END SUB


SUB CCRenderPanel
    DIM PanelX AS INTEGER
    DIM PanelY AS INTEGER
    DIM StateText AS STRING
    DIM WorkMask AS STRING
    DIM WorkX AS INTEGER
    DIM EdgeMask AS STRING
    DIM EdgeY AS INTEGER

    PanelX = CC_DISPLAY_W + 16
    PanelY = 14

    COLOR _RGB32(240, 240, 240), _RGB32(24, 24, 24)
    _FONT 8
    _PRINTSTRING (PanelX, PanelY), "DIVER QB64 CELL ENGINE V06"
    PanelY = PanelY + 20
    _PRINTSTRING (PanelX, PanelY), CCScenario

    PanelY = PanelY + 28
    _PRINTSTRING (PanelX, PanelY), "Type answers on the DIVER screen"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "R restart and re-enter WD/mode"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "P pause/resume; SPACE single tick"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "C copy between prompts; ESC close"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "F2 copy while an answer prompt is active"

    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Font: embedded Bedstead bitmap"

    PanelY = PanelY + 28
    _PRINTSTRING (PanelX, PanelY), "SOURCE through [8100]; cell-engine test"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "WD:" + STR$(BASIC_WD) + "  mode: " + DIVERModeLabel$
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "TK:" + STR$(BASIC_TK) + "  IK:" + STR$(BASIC_IK)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "XS:" + STR$(BASIC_XS) + "  YS:" + STR$(BASIC_YS)

    PanelY = PanelY + 20
    StateText = "Tick:" + STR$(BASIC_TickCount) + " vectors:" + STR$(BASIC_VectorCount)
    StateText = StateText + " ascend:" + STR$(BASIC_AscendTickCount)
    StateText = StateText + " decomp:" + STR$(BASIC_DecompressPassCount)
    StateText = StateText + " rest:" + STR$(BASIC_RestPassCount)
    _PRINTSTRING (PanelX, PanelY), StateText
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "CL:" + STR$(BASIC_CL) + "  AD:" + STR$(BASIC_AD)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "LP,LQ:" + STR$(BASIC_LastLP) + "," + STR$(BASIC_LastLQ)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "MP,MQ:" + STR$(BASIC_LastMP) + "," + STR$(BASIC_LastMQ)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "NA:" + STR$(BASIC_NA) + "  PA:" + STR$(BASIC_PA_scalar) + _
        "  AL:" + STR$(BASIC_AL_scalar)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Input BT:" + STR$(BASIC_BottomTime) + "  source BT:" + _
        STR$(BASIC_BT)
    PanelY = PanelY + 14
    IF BASIC_AL_scalar > 0 THEN
        IF BASIC_AL(BASIC_AL_scalar, 1) = 2 THEN
            StateText = "Type:2 rate:" + LTRIM$(STR$(BASIC_AL(BASIC_AL_scalar, 2)))
            StateText = StateText + " target:" + LTRIM$(STR$(BASIC_AL(BASIC_AL_scalar, 4)))
            StateText = StateText + " end:" + LTRIM$(STR$(BASIC_AL(BASIC_AL_scalar, 7)))
            _PRINTSTRING (PanelX, PanelY), StateText
        ELSE
            _PRINTSTRING (PanelX, PanelY), "Current type:" + STR$(BASIC_AL(BASIC_AL_scalar, 1)) _
                + "  duration:" + STR$(BASIC_AL(BASIC_AL_scalar, 2))
        END IF
    END IF
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "WORK ticks:" + STR$(BASIC_WorkTickCount) + "  dots:" + _
        STR$(BASIC_WorkDotCount) + " gaps:" + STR$(BASIC_WorkGapCount) + " bands:" + _
        STR$(BASIC_BandBarCount)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Fragments:" + STR$(BASIC_WorkFragmentCount) + "  WE:" + _
        STR$(BASIC_WE) + " HT:" + STR$(BASIC_HT) + " D5:" + STR$(BASIC_D5) + " DX:" + _
        STR$(BASIC_DX)

    PanelY = PanelY + 28
    IF CCState.Mode = CC_PLOT_MODE THEN
        StateText = "Mode: PLOT  submode:" + STR$(CCState.PlotSubmode)
    ELSE
        StateText = "Mode: TEXT"
    END IF
    _PRINTSTRING (PanelX, PanelY), StateText
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "FG/BG:" + STR$(CCState.Foreground) + "/" + _
        STR$(CCState.Background)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Large:" + STR$(CCState.LargeCharacters <> 0) + "  Flag:" + _
        STR$(CCState.Flag <> 0)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Suppressed text bytes:" + STR$(CCState.SuppressedTextBytes)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Graphics blocks:" + STR$(CCCountGraphicsBlocks&)

    PanelY = PanelY + 14
    FOR WorkX = 50 TO 53
        IF CCGraphicsAt%(WorkX, 60) = 0 THEN
            WorkMask = WorkMask + "#"
        ELSE
            WorkMask = WorkMask + "."
        END IF
    NEXT WorkX
    _PRINTSTRING (PanelX, PanelY), "WORK row 50-53: " + WorkMask

    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "DM: " + CCTextSlice$(69, 4, 6) + " |" + CCTextSlice$(69, 7, _
        6) + "|" + CCTextSlice$(69, 9, 6) + "| D=" + CCTextSlice$(76, 4, 2)

    FOR EdgeY = 61 TO 63
        IF CCGraphicsAt%(32, EdgeY) = 4 THEN
            EdgeMask = EdgeMask + "B"
        ELSE
            EdgeMask = EdgeMask + "."
        END IF
    NEXT EdgeY
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Blue edge x32/y61-63: " + EdgeMask

    PanelY = PanelY + 20
    COLOR _RGB32(90, 240, 130), _RGB32(24, 24, 24)
    IF BASIC_AL_scalar >= 11 AND BASIC_AL(BASIC_AL_scalar, 1) = 5 THEN
        _PRINTSTRING (PanelX, PanelY), "REST activated at surface"
    ELSEIF BASIC_DecompressCompletionCount >= 2 THEN
        _PRINTSTRING (PanelX, PanelY), "Final ASCEND active"
    ELSEIF BASIC_AL_scalar >= 9 AND BASIC_AL(BASIC_AL_scalar, 1) = 4 THEN
        _PRINTSTRING (PanelX, PanelY), "5m DECOMPRESS active"
    ELSEIF BASIC_DecompressCompleted THEN
        _PRINTSTRING (PanelX, PanelY), "ASCEND after DECOMPRESS active"
    ELSEIF BASIC_DecompressPassCount >= 1 THEN
        _PRINTSTRING (PanelX, PanelY), "DECOMPRESS pass" + STR$(BASIC_DecompressPassCount)
    ELSEIF BASIC_AL_scalar > 0 AND BASIC_AL(BASIC_AL_scalar, 1) = 4 THEN
        _PRINTSTRING (PanelX, PanelY), "DECOMPRESS activated at CL=23.75"
    ELSEIF BASIC_AscendTickCount >= 1 THEN
        _PRINTSTRING (PanelX, PanelY), "First ASCEND pass complete at CL=21.75"
    ELSEIF BASIC_AL_scalar > 0 AND BASIC_AL(BASIC_AL_scalar, 1) = 2 THEN
        _PRINTSTRING (PanelX, PanelY), "ASCEND activated at CL=21.75"
    ELSEIF BASIC_WorkFragmentCount >= 4 THEN
        _PRINTSTRING (PanelX, PanelY), "Final WORK fragment active"
    ELSEIF BASIC_BandBarCount > 0 THEN
        _PRINTSTRING (PanelX, PanelY), "Current WORK fragment continues"
    ELSEIF BASIC_WorkActivated THEN
        _PRINTSTRING (PanelX, PanelY), "WORK active; awaiting first band"
    ELSEIF BASIC_DescendComplete THEN
        _PRINTSTRING (PanelX, PanelY), "DESCEND at physical working depth"
    ELSEIF BASIC_DivePaused THEN
        _PRINTSTRING (PanelX, PanelY), "DESCEND paused"
    ELSE
        _PRINTSTRING (PanelX, PanelY), "Live predictive scheduler slice"
    END IF
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "[2140]/[5700-5890] REST NEXT translated"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Stops after REST [1789]; before [1790]"
END SUB


SUB DIVERCopyDiagnostics
    DIM Report AS STRING
    DIM NL AS STRING
    DIM ModeText AS STRING
    DIM WorkMask AS STRING
    DIM WorkX AS INTEGER
    DIM EdgeMask AS STRING
    DIM EdgeY AS INTEGER
    DIM AscendMask AS STRING
    DIM AscendY AS INTEGER

    NL = CHR$(13) + CHR$(10)
    IF CCState.Mode = CC_PLOT_MODE THEN
        ModeText = "PLOT submode" + STR$(CCState.PlotSubmode)
    ELSE
        ModeText = "TEXT"
    END IF

    FOR WorkX = 50 TO 53
        IF CCGraphicsAt%(WorkX, 60) = 0 THEN
            WorkMask = WorkMask + "#"
        ELSE
            WorkMask = WorkMask + "."
        END IF
    NEXT WorkX
    FOR EdgeY = 61 TO 63
        IF CCGraphicsAt%(32, EdgeY) = 4 THEN
            EdgeMask = EdgeMask + "B"
        ELSE
            EdgeMask = EdgeMask + "."
        END IF
    NEXT EdgeY
    FOR AscendY = 60 TO 74
        IF CCGraphicsAt%(54, AscendY) = 0 THEN
            AscendMask = AscendMask + "#"
        ELSE
            AscendMask = AscendMask + "."
        END IF
    NEXT AscendY

    Report = "DIVER QB64 CELL ENGINE V06" + NL
    Report = Report + "Status: " + CCScenario + NL
    Report = Report + "WD:" + STR$(BASIC_WD) + " mode:" + DIVERModeLabel$ + " TK:" + _
        STR$(BASIC_TK) + " IK:" + STR$(BASIC_IK) + " XS:" + STR$(BASIC_XS) + " YS:" + _
        STR$(BASIC_YS) + NL
    Report = Report + "Tick:" + STR$(BASIC_TickCount) + " vectors:" + STR$(BASIC_VectorCount)
    Report = Report + " ascend passes:" + STR$(BASIC_AscendTickCount)
    Report = Report + " decompress passes:" + STR$(BASIC_DecompressPassCount)
    Report = Report + " REST passes:" + STR$(BASIC_RestPassCount) + NL
    Report = Report + "CL:" + STR$(BASIC_CL) + " AD:" + STR$(BASIC_AD) + " LP,LQ:" + _
        STR$(BASIC_LastLP) + "," + STR$(BASIC_LastLQ) + " MP,MQ:" + STR$(BASIC_LastMP) + "," + _
        STR$(BASIC_LastMQ) + NL
    Report = Report + "NA:" + STR$(BASIC_NA) + " PA:" + STR$(BASIC_PA_scalar) + " AL:" + _
        STR$(BASIC_AL_scalar) + NL
    IF BASIC_AL_scalar > 0 THEN
        Report = Report + "Activity type:" + STR$(BASIC_AL(BASIC_AL_scalar, 1))
        Report = Report + " field2:" + STR$(BASIC_AL(BASIC_AL_scalar, 2))
        Report = Report + " from:" + STR$(BASIC_AL(BASIC_AL_scalar, 3))
        Report = Report + " target:" + STR$(BASIC_AL(BASIC_AL_scalar, 4))
        Report = Report + " default:" + STR$(BASIC_AL(BASIC_AL_scalar, 5))
        Report = Report + " start:" + STR$(BASIC_AL(BASIC_AL_scalar, 6))
        Report = Report + " end:" + STR$(BASIC_AL(BASIC_AL_scalar, 7)) + NL
    END IF
    Report = Report + "Input BT:" + STR$(BASIC_BottomTime) + " source BT:" + STR$(BASIC_BT) + NL
    Report = Report + "WORK ticks:" + STR$(BASIC_WorkTickCount)
    Report = Report + " dots:" + STR$(BASIC_WorkDotCount) + " gaps:" + STR$(BASIC_WorkGapCount)
    Report = Report + " bands:" + STR$(BASIC_BandBarCount)
    Report = Report + " fragments:" + STR$(BASIC_WorkFragmentCount) + NL
    Report = Report + "WE:" + STR$(BASIC_WE) + " HT:" + STR$(BASIC_HT) + " D5:" + _
        STR$(BASIC_D5) + " DX:" + STR$(BASIC_DX) + NL
    Report = Report + "Mode:" + ModeText
    Report = Report + " FG/BG:" + STR$(CCState.Foreground) + "/" + STR$(CCState.Background)
    Report = Report + " large:" + STR$(CCState.LargeCharacters <> 0)
    Report = Report + " flag:" + STR$(CCState.Flag <> 0) + NL
    Report = Report + "Suppressed text bytes:" + STR$(CCState.SuppressedTextBytes) + _
        " graphics blocks:" + STR$(CCCountGraphicsBlocks&) + NL
    Report = Report + "WORK row 50-53: " + WorkMask + NL
    Report = Report + "DM: " + CCTextSlice$(69, 4, 6) + " |" + CCTextSlice$(69, 7, 6) + "|" + _
        CCTextSlice$(69, 9, 6) + "| D=" + CCTextSlice$(76, 4, 2) + NL
    Report = Report + "Blue edge x32/y61-63: " + EdgeMask + NL
    Report = Report + "ASCEND x54/y60-74: " + AscendMask + NL
    Report = Report + "PLOT cells: 8-bit glyph + shared FG/BG" + NL
    Report = Report + "PLOT 29: OR; PLOT 30: XOR" + NL
    Report = Report + "X32 CH/AT:"
    Report = Report + " " + LTRIM$(STR$(BASIC_CellTraceGlyph(1))) + "/" + _
        LTRIM$(STR$(BASIC_CellTraceAttribute(1)))
    Report = Report + " " + LTRIM$(STR$(BASIC_CellTraceGlyph(2))) + "/" + _
        LTRIM$(STR$(BASIC_CellTraceAttribute(2)))
    Report = Report + " " + LTRIM$(STR$(BASIC_CellTraceGlyph(3))) + "/" + _
        LTRIM$(STR$(BASIC_CellTraceAttribute(3)))
    Report = Report + " " + LTRIM$(STR$(BASIC_CellTraceGlyph(4))) + "/" + _
        LTRIM$(STR$(BASIC_CellTraceAttribute(4))) + NL
    Report = Report + "X33 CH/AT:"
    Report = Report + " " + LTRIM$(STR$(BASIC_CellTraceGlyph(5))) + "/" + _
        LTRIM$(STR$(BASIC_CellTraceAttribute(5)))
    Report = Report + " " + LTRIM$(STR$(BASIC_CellTraceGlyph(6))) + "/" + _
        LTRIM$(STR$(BASIC_CellTraceAttribute(6)))
    Report = Report + " " + LTRIM$(STR$(BASIC_CellTraceGlyph(7))) + "/" + _
        LTRIM$(STR$(BASIC_CellTraceAttribute(7)))
    Report = Report + " " + LTRIM$(STR$(BASIC_CellTraceGlyph(8))) + "/" + _
        LTRIM$(STR$(BASIC_CellTraceAttribute(8))) + NL
    Report = Report + "CCEMU target: X32 160/39 160/39 160/39 8/160" + NL
    Report = Report + "CCEMU target: X33 8/160 200/167 200/167 200/184" + NL
    Report = Report + "Graph adapters: none" + NL
    Report = Report + "GOSUB 7500 completions:" + STR$(BASIC_DecompressCompletionCount) + _
        " HT:" + STR$(BASIC_HT) + NL
    Report = Report + "WM:" + STR$(BASIC_WM) + " NS:" + STR$(BASIC_NS) + NL
    IF BASIC_DiveEnded THEN Report = Report + "GOSUB 8000: MEMORY display complete; [1820] END" _
        + NL

    _CLIPBOARD$ = Report
    BEEP
END SUB


FUNCTION DIVERModeLabel$
    ' Diagnostic label only. The source selects ACCELERATED for every answer
    ' other than REAL, including a blank answer; do not rewrite the input.
    IF BASIC_TimeMode = "REAL" THEN
        DIVERModeLabel$ = "REAL"
    ELSE
        DIVERModeLabel$ = "ACCELERATED"
    END IF
END FUNCTION


SUB CCAddResult (Description AS STRING, Passed AS INTEGER)
    IF CCResultCount >= UBOUND(CCResultText) THEN EXIT SUB
    CCResultCount = CCResultCount + 1
    CCResultText(CCResultCount) = Description
    CCResultPassed(CCResultCount) = Passed
END SUB


SUB CCRunTests
    DIM CountValue AS LONG

    CCResultCount = 0

    ' P01: [1010] complete ordered control chain.
    CCReset
    CCSend1010
    CCAddResult "[1010] page erased blue", CCTextBackground(0, 0) = 4
    CCAddResult "[1010] erased blank byte is 160", CCTextCode(16, 32) = 32 AND _
        CCTextLarge(16, 32) <> 0
    CCAddResult "[1010] later BG is cyan", CCState.Background = 6
    CCAddResult "[1010] LARGE is active", CCState.LargeCharacters <> 0

    ' P04: [1261]-[1266] title does not become ordinary text in Plot Mode.
    CCReset
    CCPlotBegin
    CCSendPlot3 2, 14, 15
    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."
    CCAddResult "title hidden in Plot Mode", CCTextAt%(29, 43, ASC("D")) = 0
    CCAddResult "hidden bytes recorded", CCState.SuppressedTextBytes = 23

    ' P05: diagnostic PLOT 255 restores ordinary text output.
    CCPlotBegin
    CCSend 255
    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."
    CCAddResult "PLOT 255 reveals title", CCTextAt%(29, 43, ASC("D"))

    ' P06: [1273]-[1277] bar state survives separate PLOT statements.
    CCReset
    CCPlotBegin
    CCSendPlot3 2, 250, 0
    CCPlotBegin
    CCSendPlot2 140, 1
    CCPlotBegin
    CCSend 255
    CCAddResult "X-bar spans x=0..1", CCGraphicsAt%(0, 140) >= 0 AND CCGraphicsAt%(1, 140) >= 0

    ' P08: [6320] point followed by Vector Mode.
    CCReset
    CCApplyCCI 32
    CCPlotBegin
    CCSendPlot7 2, 253, 10, 140, 242, 13, 60
    CountValue = CCCountGraphicsBlocks&
    CCAddResult "vector includes both ends", CCGraphicsAt%(10, 140) >= 0 AND CCGraphicsAt%(13, _
        60) >= 0
    CCAddResult "vector best-fit block count", CountValue = 81

    ' Code 14 consumes two text rows; Code 15 restores normal height.
    CCReset
    CCPlotBegin
    CCSend 14
    CCPlotBegin
    CCSendPlot3 3, 10, 5
    CCWriteText "A"
    CCAddResult "LARGE occupies next row", CCCellKind(10, 6) = CC_CELL_LARGE_CONTINUATION
    CCPlotBegin
    CCSend 15
    CCPlotBegin
    CCSendPlot3 3, 12, 5
    CCWriteText "B"
    CCAddResult "Code 15 restores one row", CCCellKind(12, 6) <> CC_CELL_LARGE_CONTINUATION
END SUB


SUB CCBuildEngineDemonstration
    CCReset
    CCScenario = "Protocol state and mixed output"

    CCSend1010

    ' The page was erased while the background was blue. Cyan becomes the
    ' background for subsequent text, matching the ordered [1010] effects.
    CCPlotBegin
    CCSend 15
    CCPlotBegin
    CCSendPlot3 3, 2, 2
    CCWriteText "NORMAL"

    CCPlotBegin
    CCSend 14
    CCPlotBegin
    CCSendPlot3 3, 2, 5
    CCWriteText "LARGE"

    CCPlotBegin
    CCSend 15
    CCPlotBegin
    CCSendPlot3 3, 2, 9
    CCWriteText "80 x 48 TEXT / 160 x 192 PLOT"

    ' Black on blue profile-like vector and bar examples.
    CCPlotBegin
    CCSendPlot2 6, 32
    CCPlotBegin
    CCSendPlot7 2, 253, 10, 140, 242, 13, 60
    CCPlotBegin
    CCSend 255

    CCPlotBegin
    CCSendPlot3 2, 250, 20
    CCPlotBegin
    CCSendPlot2 50, 70
    CCPlotBegin
    CCSendPlot2 55, 90
    CCPlotBegin
    CCSend 255
END SUB


SUB CCBuildHiddenTitleDemonstration
    CCReset
    CCScenario = "[1265]-[1266]: title suppressed"

    CCApplyCCI 38
    CCClearPage

    ' [1261] enters Graphic Plot Mode and plots the initial point.
    CCPlotBegin
    CCSendPlot3 2, 14, 15

    ' [1265] positions the text cursor but never leaves Plot Mode.
    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."

    ' No synthetic escape is issued here. The panel records the suppressed
    ' byte count while the terminal correctly remains in Graphic Plot Mode.
END SUB


SUB CCBuildVisibleTitleDemonstration
    CCReset
    CCScenario = "Diagnostic PLOT 255 before title"

    CCApplyCCI 38
    CCClearPage

    CCPlotBegin
    CCSendPlot3 2, 14, 15

    ' Diagnostic only. DIVER.BAS does not contain this escape here.
    CCPlotBegin
    CCSend 255

    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."
END SUB


SUB CCBuildPlotDemonstration
    DIM I AS INTEGER

    CCReset
    CCScenario = "DIVER point, vector and bar submodes"

    CCApplyCCI 38
    CCClearPage

    ' [6320]-form vector.
    CCApplyCCI 32
    CCPlotBegin
    CCSendPlot7 2, 253, 10, 140, 242, 13, 60
    CCPlotBegin
    CCSend 255

    ' [1273]-form horizontal depth ticks with persistent X0.
    CCApplyCCI 38
    CCPlotBegin
    CCSendPlot3 2, 250, 0
    FOR I = 140 TO 40 STEP -10
        CCPlotBegin
        CCSendPlot2 I, 1
    NEXT I
    CCPlotBegin
    CCSend 255

    ' [1346]-form vertical time ticks with persistent Y0.
    CCPlotBegin
    CCSendPlot3 2, 246, 34
    FOR I = 1 TO 141 STEP 20
        CCPlotBegin
        CCSendPlot2 I + 10, 35
    NEXT I
    CCPlotBegin
    CCSend 255
END SUB


SUB CCSend1010
    ' [1010] PLOT 6,39,12,30,22,14
    CCPlotBegin
    CCSendPlot6 6, 39, 12, 30, 22, 14
END SUB


SUB CCSendPlot2 (A AS INTEGER, B AS INTEGER)
    CCSend A
    CCSend B
END SUB


SUB CCSendPlot3 (A AS INTEGER, B AS INTEGER, C AS INTEGER)
    CCSend A
    CCSend B
    CCSend C
END SUB


SUB CCSendPlot4 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER)
    CCSend A
    CCSend B
    CCSend C
    CCSend D
END SUB


SUB CCSendPlot6 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, F AS _
    INTEGER)
    CCSend A
    CCSend B
    CCSend C
    CCSend D
    CCSend E
    CCSend F
END SUB


SUB CCSendPlot7 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, F AS _
    INTEGER, G AS INTEGER)
    CCSend A
    CCSend B
    CCSend C
    CCSend D
    CCSend E
    CCSend F
    CCSend G
END SUB


FUNCTION CCCountGraphicsBlocks&
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM BitNumber AS INTEGER
    DIM BitMask AS INTEGER
    DIM CountValue AS LONG

    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            IF CCCellKind(Column, Row) = CC_CELL_GRAPHICS THEN
                FOR BitNumber = 0 TO 7
                    BitMask = 2 ^ BitNumber
                    IF (CCPlotGlyph(Column, Row) AND BitMask) <> 0 THEN CountValue = CountValue _
                        + 1
                NEXT BitNumber
            END IF
        NEXT Column
    NEXT Row
    CCCountGraphicsBlocks& = CountValue
END FUNCTION


FUNCTION CCGraphicsAt% (X AS INTEGER, Y AS INTEGER)
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM BitNumber AS INTEGER
    DIM BitMask AS INTEGER

    X = CCWrapX%(X)
    Y = CCWrapY%(Y)
    Column = X \ 2
    Row = CC_TEXT_ROWS - 1 - (Y \ 4)
    IF CCCellKind(Column, Row) <> CC_CELL_GRAPHICS THEN
        CCGraphicsAt% = -1
        EXIT FUNCTION
    END IF
    BitNumber = 3 - (Y MOD 4) + 4 * (X MOD 2)
    BitMask = 2 ^ BitNumber
    IF (CCPlotGlyph(Column, Row) AND BitMask) <> 0 THEN
        CCGraphicsAt% = CCPlotForeground(Column, Row)
    ELSE
        CCGraphicsAt% = CCPlotBackground(Column, Row)
    END IF
END FUNCTION


FUNCTION CCTextAt% (Column AS INTEGER, Row AS INTEGER, CharacterCode AS INTEGER)
    CCTextAt% = 0
    IF Column < 0 OR Column >= CC_TEXT_COLS THEN EXIT FUNCTION
    IF Row < 0 OR Row >= CC_TEXT_ROWS THEN EXIT FUNCTION
    IF CCCellKind(Column, Row) <> CC_CELL_TEXT THEN EXIT FUNCTION
    IF CCTextCode(Column, Row) = CharacterCode THEN CCTextAt% = -1
END FUNCTION


SUB DIVERInteractiveStartup
    DIM BASIC_I AS SINGLE
    DIM BASIC_J AS INTEGER
    DIM BASIC_Y1 AS INTEGER
    DIM BASIC_YO AS INTEGER
    DIM InputValue AS STRING

    CCReset

    BASIC_DiveRunning = 0
    BASIC_DivePaused = 0
    BASIC_DescendComplete = 0
    BASIC_WorkActivated = 0
    BASIC_WorkStartedThisPass = 0
    BASIC_PromptAnswered = 0
    BASIC_BottomTime = 0
    BASIC_BT = 0
    BASIC_WorkTickCount = 0
    BASIC_WorkDotCount = 0
    BASIC_WorkGapCount = 0
    BASIC_BandBarCount = 0
    BASIC_WorkFragmentCount = 0
    FOR BASIC_I = 1 TO 8
        BASIC_CellTraceGlyph(BASIC_I) = 0
        BASIC_CellTraceAttribute(BASIC_I) = 0
    NEXT BASIC_I
    BASIC_AscendTickCount = 0
    BASIC_DecompressPassCount = 0
    BASIC_DecompressCompleted = 0
    BASIC_DecompressCompletionCount = 0
    BASIC_RestPassCount = 0
    BASIC_DiveEnded = 0
    BASIC_NA = 0
    BASIC_TickCount = 0
    BASIC_VectorCount = 0
    BASIC_LastLP = 0
    BASIC_LastLQ = 0
    BASIC_LastMP = 0
    BASIC_LastMQ = 0
    BASIC_WE = 0
    BASIC_HT = 0
    BASIC_D5 = 0
    BASIC_DX = 0
    BASIC_E5 = 0
    BASIC_EX = 0
    BASIC_WM = 0
    BASIC_NS = 0
    BASIC_I6 = 0
    BASIC_L2 = 0

    BASIC_WD = 0
    BASIC_TimeMode = ""
    CCScenario = "Waiting for WORKING DEPTH"

    ' Original: 1010 PLOT 6,39,12,30,22,14
    ' Translation: preserve all six bytes and their original order.
    CCPlotBegin
    CCSend 6
    CCSend 39
    CCSend 12
    CCSend 30
    CCSend 22
    CCSend 14

    ' Original: 1040 FOR I=0 TO 5 ... 1100 NEXT I:PLOT 30,16
    FOR BASIC_I = 0 TO 5
        ' [1050-1070] PRINT 79 spaces
        FOR BASIC_J = 0 TO 78
            CCWriteText " "
        NEXT BASIC_J

        ' [1080-1085] Y1=191-8*I:YO=Y1-7
        BASIC_Y1 = 191 - 8 * BASIC_I
        BASIC_YO = BASIC_Y1 - 7

        ' [1090] PLOT 2,246,YO,158,Y1,246,YO,159,Y1,255
        CCPlotBegin
        CCSend 2
        CCSend 246
        CCSend BASIC_YO
        CCSend 158
        CCSend BASIC_Y1
        CCSend 246
        CCSend BASIC_YO
        CCSend 159
        CCSend BASIC_Y1
        CCSend 255

        ' [1095] PRINT
        CCNewLine
    NEXT BASIC_I

    ' [1100] PLOT 30,16
    CCPlotBegin
    CCSend 30
    CCSend 16

    ' [1210-1260] Clear five rows of the Dive Monitor area.
    FOR BASIC_I = 1 TO 5
        ' [1230] PLOT 3,66,I*2
        CCPlotBegin
        CCSend 3
        CCSend 66
        CCSend BASIC_I * 2

        ' [1240-1255] PRINT thirteen spaces
        FOR BASIC_J = 66 TO 78
            CCWriteText " "
        NEXT BASIC_J
    NEXT BASIC_I

    ' [1261] PLOT 6,38,8,2,14,15
    CCPlotBegin
    CCSend 6
    CCSend 38
    CCSend 8
    CCSend 2
    CCSend 14
    CCSend 15

    ' [1262] PLOT 27,10,27,10
    CCPlotBegin
    CCSend 27
    CCSend 10
    CCSend 27
    CCSend 10

    ' [1263] PRINT "5 METRE UNITS";
    DIVERWriteVerticalLegend

    ' [1264] PLOT 27,11,27,11
    CCPlotBegin
    CCSend 27
    CCSend 11
    CCSend 27
    CCSend 11

    ' [1265] PRINT:PLOT 3,29,43:PRINT "DIVER SIMULATION MODEL."
    CCNewLine
    CCPlotBegin
    CCSend 3
    CCSend 29
    CCSend 43
    CCWriteText "DIVER SIMULATION MODEL."

    ' [1266] PLOT 3,29,44:PRINT "-----------------------"
    CCPlotBegin
    CCSend 3
    CCSend 29
    CCSend 44
    CCWriteText "-----------------------"

    ' [1273] PLOT 2,250,0
    CCPlotBegin
    CCSend 2
    CCSend 250
    CCSend 0

    ' [1274-1276] FOR I=140 TO 40 STEP -10:PLOT I,1:NEXT I
    FOR BASIC_I = 140 TO 40 STEP -10
        CCPlotBegin
        CCSend BASIC_I
        CCSend 1
    NEXT BASIC_I

    ' [1277] PLOT 255
    CCPlotBegin
    CCSend 255

    ' [1278-1281] Ring the warning bell, then repeat GOSUB 5000 until
    ' the entered working depth is greater than zero and less than 50.
    DO
        BEEP
        CCPlotBegin
        CCSend 6
        CCSend 48
        InputValue = DIVERReadInput$("WORKING DEPTH ")
        BASIC_WD = VAL(InputValue)
        DIVERClearInputLine 14
        IF BASIC_WD <= 0 OR BASIC_WD >= 50 THEN CCScenario = "WORKING DEPTH must be 1-49"
    LOOP WHILE BASIC_WD <= 0 OR BASIC_WD >= 50

    ' [1300-1301] Initial simulation values.
    BASIC_DR = 30
    BASIC_AR = 15
    BASIC_AD = 0
    BASIC_CL = 0

    ' [1303-1309] INPUT time mode. Only the literal REAL selects TK=1/32;
    ' every other answer follows the source ACCELERATED path with TK=.25.
    CCScenario = "Waiting for TIME MODE"
    BEEP
    BASIC_TimeMode = UCASE$(DIVERReadInput$("TIME MODE (REAL OR ACCELERATED)? "))
    DIVERClearInputLine 50
    IF BASIC_TimeMode = "REAL" THEN
        BASIC_TK = 1 / 32
    ELSE
        BASIC_TK = .25
    END IF

    ' [1316-1317] IK=TK:IF IK<0.5 THEN IK=0.5
    BASIC_IK = BASIC_TK
    IF BASIC_IK < .5 THEN BASIC_IK = .5

    ' [1320-1345] Select the source time and depth scales.
    BASIC_XS = 1
    IF BASIC_WD < 17 THEN BASIC_XS = .5
    IF BASIC_WD > 20 THEN BASIC_XS = 2
    BASIC_YS = 2

    ' [1346] PLOT 6,38,2,246,34
    CCPlotBegin
    CCSend 6
    CCSend 38
    CCSend 2
    CCSend 246
    CCSend 34

    ' [1348] FOR I=1 TO 150 STEP XS*10:PLOT I+10,35:NEXT I:PLOT 255
    FOR BASIC_I = 1 TO 150 STEP BASIC_XS * 10
        CCPlotBegin
        CCSend BASIC_I + 10
        CCSend 35
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255

    ' [1360-1361] PLOT 3,27,40:PRINT "TIME AT 10 MINUTE INTERVALS";
    CCPlotBegin
    CCSend 3
    CCSend 27
    CCSend 40
    CCWriteText "TIME AT 10 MINUTE INTERVALS"

    ' [1362-1368] CO=1:FL=0 and six GOSUB 7000 calls spell NOSTOP.
    DIVERDisplayMonitorCell 1, ASC("N"), 1, 0
    DIVERDisplayMonitorCell 2, ASC("O"), 1, 0
    DIVERDisplayMonitorCell 3, ASC("S"), 1, 0
    DIVERDisplayMonitorCell 4, ASC("T"), 1, 0
    DIVERDisplayMonitorCell 5, ASC("O"), 1, 0
    DIVERDisplayMonitorCell 6, ASC("P"), 1, 0

    ' [1349-1355] Remaining display state used by the initial gauge calls.
    BASIC_AY = -1
    BASIC_LA = 0

    ' [1445] GOSUB 6600:GOSUB 6700
    DIVERGosub6600
    DIVERGosub6700

    DIVERInitialiseDiveTable
    DIVERInitialiseScheduler
    BASIC_DiveRunning = -1
    BASIC_NextWallTick = TIMER(.001) + .6
    CCScenario = "DESCEND ready; first [1465] pass pending"
END SUB


SUB DIVERInitialiseDiveTable
    DIM I AS INTEGER
    DIM J AS INTEGER

    RESTORE DIVERDiveTableData
    FOR I = 1 TO 21
        FOR J = 1 TO 7
            READ BASIC_DT(I, J)
        NEXT J
    NEXT I

    ' [150] C(1..7) is the source's colour-attribute permutation.
    BASIC_C(1) = 20
    BASIC_C(2) = 23
    BASIC_C(3) = 18
    BASIC_C(4) = 22
    BASIC_C(5) = 19
    BASIC_C(6) = 17
    BASIC_C(7) = 16
END SUB


SUB DIVERInitialiseScheduler
    DIM I AS INTEGER
    DIM J AS INTEGER

    ' [1370] DIM PA(8,5); [1371] seed the initial DESCEND request.
    FOR I = 0 TO 8
        FOR J = 0 TO 5
            BASIC_PA(I, J) = 0
        NEXT J
    NEXT I
    BASIC_PA(1, 1) = 1
    BASIC_PA(1, 2) = BASIC_DR
    BASIC_PA(1, 3) = 0
    BASIC_PA(1, 4) = BASIC_WD
    BASIC_PA(1, 5) = 3
    BASIC_PA_scalar = 1 ' [1410] PA=1

    ' [1416-1440] Initialise the event stack and its pointer.
    FOR I = 0 TO 30
        FOR J = 0 TO 2
            BASIC_ES(I, J) = 0
        NEXT J
    NEXT I
    BASIC_ES(0, 1) = 0
    BASIC_ES(0, 2) = 0
    BASIC_ES(1, 1) = 0
    BASIC_ES(1, 2) = 0
    BASIC_ES_scalar = 1
    BASIC_EP = 0

    ' [1460] DIM AL(15,7); [1320] LM=0.
    FOR I = 0 TO 15
        FOR J = 0 TO 7
            BASIC_AL(I, J) = 0
        NEXT J
    NEXT I
    BASIC_AL_scalar = 0
    BASIC_P = 0
    BASIC_CK = 0
    BASIC_LM = 0
END SUB


SUB DIVERAdvanceSchedulerTick
    IF NOT BASIC_DiveRunning THEN EXIT SUB

    BASIC_WorkStartedThisPass = 0
    BASIC_TickCount = BASIC_TickCount + 1

    ' [1465] Preserve the pre-pass clock and depth for GOSUB 6300.
    BASIC_AA = BASIC_CL
    BASIC_BB = BASIC_AD

    ' [1466-1470] End-event passes do not advance CL. Ordinary passes do.
    IF BASIC_ES(BASIC_EP, 1) <> 1 THEN
        BASIC_CL = BASIC_CL + BASIC_TK
        IF BASIC_TK <> 1 THEN
            IF BASIC_CL - INT(BASIC_CL) >= .999 THEN BASIC_CL = INT(BASIC_CL) + 1
            IF BASIC_CL - INT(BASIC_CL) <= .001 THEN BASIC_CL = INT(BASIC_CL)
        END IF
    END IF

    ' [1471-2200] A due end event may construct a successor and immediately
    ' loop back to activate its type-0 start event without another clock step.
    DIVERDispatchDueEvents
    IF BASIC_WorkStartedThisPass OR NOT BASIC_DiveRunning THEN EXIT SUB
    IF BASIC_AL_scalar < 1 THEN EXIT SUB

    ' [3010-3036] Ask early enough for the current activity to keep moving
    ' after the answer while the stored successor waits for the true boundary.
    DIVERPredictiveActivityPrompt
    IF NOT BASIC_DiveRunning THEN EXIT SUB

    ' [3400-3408] Advance DESCEND or ASCEND and clamp at the activity target.
    IF BASIC_AL(BASIC_AL_scalar, 1) = 1 THEN
        IF BASIC_AD + BASIC_DR * BASIC_TK > BASIC_AL(BASIC_AL_scalar, 4) THEN
            BASIC_AD = BASIC_AL(BASIC_AL_scalar, 4)
        ELSE
            BASIC_AD = BASIC_AD + BASIC_DR * BASIC_TK
        END IF
    ELSEIF BASIC_AL(BASIC_AL_scalar, 1) = 2 THEN
        IF BASIC_AD - BASIC_AR * BASIC_TK < BASIC_AL(BASIC_AL_scalar, 4) THEN
            BASIC_AD = BASIC_AL(BASIC_AL_scalar, 4)
        ELSE
            BASIC_AD = BASIC_AD - BASIC_AR * BASIC_TK
        END IF
    END IF

    ' [3410], [3510], [3520] retain the verified Stage 4 display path.
    DIVERPlotCurrentProfileTick
    DIVERGosub6600
    DIVERGosub6700
    DIVERGosub6750 ' [3530]

    ' [3530-3540] Type 4 skips GOSUB 6750's type-1/type-3 display and then
    ' counts down the total decompression requirement in GOSUB 6800.
    IF BASIC_AL(BASIC_AL_scalar, 1) = 4 THEN
        DIVERGosub6800
        BASIC_DecompressPassCount = BASIC_DecompressPassCount + 1
        CCScenario = "DECOMPRESS pass" + STR$(BASIC_DecompressPassCount) + " complete at CL=" + _
            LTRIM$(STR$(BASIC_CL))
        EXIT SUB
    END IF

    IF BASIC_AL(BASIC_AL_scalar, 1) = 3 THEN
        BASIC_WorkTickCount = BASIC_WorkTickCount + 1
        CCScenario = "WORK fragment" + STR$(BASIC_WorkFragmentCount) + ": tick" + _
            STR$(BASIC_WorkTickCount) + ", bands" + STR$(BASIC_BandBarCount)
    ELSEIF BASIC_AL(BASIC_AL_scalar, 1) = 2 THEN
        BASIC_AscendTickCount = BASIC_AscendTickCount + 1
        CCScenario = "ASCEND pass" + STR$(BASIC_AscendTickCount) + " complete at CL=" + _
            LTRIM$(STR$(BASIC_CL))
    ELSEIF BASIC_AL(BASIC_AL_scalar, 1) = 5 THEN
        BASIC_RestPassCount = BASIC_RestPassCount + 1
        CCScenario = "REST pass" + STR$(BASIC_RestPassCount) + " complete at CL=" + _
            LTRIM$(STR$(BASIC_CL))
    ELSEIF BASIC_AD >= BASIC_AL(BASIC_AL_scalar, 4) THEN
        BASIC_AD = BASIC_AL(BASIC_AL_scalar, 4)
        BASIC_DescendComplete = -1
        CCScenario = "Physical bottom reached; end event still pending"
    ELSEIF BASIC_PromptAnswered THEN
        CCScenario = "Successor stored; DESCEND continues"
    ELSE
        CCScenario = "DESCEND tick" + STR$(BASIC_TickCount)
    END IF
END SUB


SUB DIVERDispatchDueEvents
    DIM DispatchGuard AS INTEGER

    DO WHILE BASIC_CL >= BASIC_ES(BASIC_EP, 2) AND BASIC_DiveRunning
        DispatchGuard = DispatchGuard + 1
        IF DispatchGuard > 4 THEN
            BASIC_DiveRunning = 0
            CCScenario = "Stage 18 dispatch guard stopped an invalid loop"
            EXIT SUB
        END IF

        BASIC_EP = BASIC_EP + 1 ' [1476]
        IF BASIC_ES(BASIC_EP, 1) = 1 THEN
            DIVEREndCurrentActivity ' [1605] -> [1800]
        ELSE
            DIVERStartPendingActivity ' [1605] -> [1630]
        END IF

        ' WorkStartedThisPass is reset at the top of every scheduler pass.
        ' Unlike the persistent WorkActivated display state, it stops only
        ' the pass that actually started a WORK fragment.
        IF BASIC_WorkStartedThisPass THEN EXIT SUB
    LOOP
END SUB


SUB DIVERStartPendingActivity
    DIM I AS INTEGER
    DIM ActivityType AS INTEGER

    IF BASIC_PA_scalar < 1 THEN
        BASIC_DiveRunning = 0
        CCScenario = "No pending activity available at start event"
        EXIT SUB
    END IF

    BASIC_AL_scalar = BASIC_AL_scalar + 1 ' [1630]
    FOR I = 1 TO 5 ' [1640-1650]
        BASIC_AL(BASIC_AL_scalar, I) = BASIC_PA(BASIC_PA_scalar, I)
    NEXT I
    BASIC_PA_scalar = BASIC_PA_scalar - 1 ' [1651]
    BASIC_P = BASIC_AL_scalar ' [1652]
    BASIC_AL(BASIC_P, 6) = BASIC_CL ' [1660]
    ActivityType = BASIC_AL(BASIC_P, 1)

    SELECT CASE ActivityType ' [1665]
        CASE 1 ' [1670] DESCEND
            BASIC_AL(BASIC_P, 7) = BASIC_AL(BASIC_P, 6) + (BASIC_AL(BASIC_P, 4) - _
                BASIC_AL(BASIC_P, 3)) / BASIC_AL(BASIC_P, 2)
        CASE 2 ' [1680] ASCEND
            BASIC_AL(BASIC_P, 7) = BASIC_AL(BASIC_P, 6) + (BASIC_AL(BASIC_P, 3) - _
                BASIC_AL(BASIC_P, 4)) / BASIC_AL(BASIC_P, 2)
            ' [1682] Clear the six-character third Dive Monitor row as the
            ' ascent becomes current, before its first movement/display pass.
            FOR I = 13 TO 18
                DIVERDisplayMonitorCell I, 32, 0, 0
            NEXT I
        CASE 3, 5 ' [1690], [1710]
            BASIC_AL(BASIC_P, 7) = BASIC_AL(BASIC_P, 6) + BASIC_AL(BASIC_P, 2)
        CASE 4 ' [1700-1705] DECOMPRESS
            BASIC_AL(BASIC_P, 7) = BASIC_AL(BASIC_P, 6) + BASIC_AL(BASIC_P, 2)
            DIVERGosub6250
    END SELECT

    BASIC_ES(BASIC_EP, 2) = BASIC_AL(BASIC_P, 7) ' [1730]
    BASIC_ES_scalar = BASIC_ES_scalar + 1 ' [1740]
    BASIC_ES(BASIC_ES_scalar, 1) = 1 ' [1765]
    BASIC_ES(BASIC_ES_scalar, 2) = BASIC_AL(BASIC_P, 7)
    BASIC_CK = 0 ' [1789]

    IF ActivityType = 3 THEN
        ' [1691-1695] Initialise decompression state and the Dive Monitor for
        ' this WORK fragment before its first ordinary display pass.
        BASIC_BT = BASIC_AL(BASIC_AL_scalar, 7) ' [1691]
        DIVERGosub6100
        IF NOT BASIC_DiveRunning THEN EXIT SUB
        DIVERGosub6950
        DIVERGosub6850
        DIVERGosub6950
        BASIC_E5 = BASIC_D5
        BASIC_EX = BASIC_DX
        BASIC_WorkActivated = -1
        BASIC_WorkStartedThisPass = -1
        BASIC_WorkFragmentCount = BASIC_WorkFragmentCount + 1
        CCScenario = "WORK fragment" + STR$(BASIC_WorkFragmentCount) + _
            " active; [1691-1695] complete"
    ELSEIF ActivityType = 2 THEN
        ' [1680-1789] is complete; [1790] now enters the translated ASCEND
        ' display pass in the same scheduler dispatch.
        CCScenario = "ASCEND activated; [1790] display pass pending"
    ELSEIF ActivityType = 4 THEN
        ' [1700-1789], including GOSUB 6250, is complete. The same scheduler
        ' pass follows [1790] into DECOMPRESS's first display pass.
        CCScenario = "DECOMPRESS activated; [1790] display pass pending"
    ELSEIF ActivityType = 5 THEN
        ' [1710-1790] REST continues into its first display pass.
        CCScenario = "REST activated; [1790] display pass pending"
    END IF
END SUB


SUB DIVEREndCurrentActivity
    DIM InputValue AS STRING
    DIM Answer AS STRING
    DIM BASIC_M AS SINGLE

    ' [1800-1820] REST terminates the dive before [1881] queues a successor.
    IF BASIC_AL(BASIC_AL_scalar, 1) = 5 THEN
        DIVERGosub8000
        BASIC_DiveEnded = -1
        BASIC_DiveRunning = 0
        CCScenario = "Dive complete; MEMORY displayed at CL=" + LTRIM$(STR$(BASIC_CL))
        EXIT SUB
    END IF

    ' [1881-1882] Queue the type-0 event which starts the successor.
    BASIC_ES_scalar = BASIC_ES_scalar + 1
    BASIC_ES(BASIC_ES_scalar, 1) = 0
    BASIC_ES(BASIC_ES_scalar, 2) = 0

    ' [1888] A completed DECOMPRESS updates the monitor and advances the
    ' active stop before [1895-2110] constructs its default ASCEND successor.
    IF BASIC_AL(BASIC_AL_scalar, 1) = 4 THEN
        DIVERGosub7500
        BASIC_DecompressCompleted = -1
        BASIC_DecompressCompletionCount = BASIC_DecompressCompletionCount + 1
    END IF

    ' [1890-1893] A blank predictive answer at an intermediate WORK
    ' boundary selects the stored WORK default. If the PA stack still holds
    ' another table-derived fragment, retain that stack and ask [5503-5505]
    ' whether its duration is required instead of asking for BOTTOM TIME.
    IF BASIC_NA = 0 AND BASIC_AL(BASIC_AL_scalar, 5) = 3 THEN
        BASIC_NA = 3
        IF BASIC_PA_scalar >= 1 THEN
            BEEP
            Answer = UCASE$(DIVERReadInput$("IS NEXT STAGE =" + _
                LTRIM$(STR$(BASIC_PA(BASIC_PA_scalar, 2))) + " MIN. REQUIRED "))
            DIVERClearInputLine 48
            IF Answer = "NO" THEN
                BASIC_DiveRunning = 0
                CCScenario = "Stage 18 does not yet implement [5509] replacement BT"
            END IF
            EXIT SUB
        END IF
    END IF

    ' [1895] An unrecognised or blank predictive answer uses the activity's
    ' stored default. Initial DESCEND therefore defaults to WORK.
    IF BASIC_NA = 0 THEN BASIC_NA = BASIC_AL(BASIC_AL_scalar, 5)

    BASIC_PA_scalar = 1 ' [1900]
    BASIC_PA(1, 1) = BASIC_NA ' [1905]
    BASIC_PA(1, 3) = BASIC_AL(BASIC_AL_scalar, 4) ' [1910]

    SELECT CASE BASIC_NA ' [2010]
        CASE 2 ' [2050] GOSUB 5400 - ASCEND to the current stop depth
            BASIC_PA(1, 2) = BASIC_AR
            BASIC_PA(1, 4) = BASIC_HT ' [5420]
            BASIC_PA(1, 5) = 5 ' [5430] REST at the surface
            IF BASIC_HT <> 0 THEN BASIC_PA(1, 5) = 4 ' [5450] DECOMPRESS at HT

        CASE 3 ' [2080-2085] GOSUB 5500 - initial WORK request
            BASIC_PA(1, 2) = -1
            BEEP
            InputValue = DIVERReadInput$("BOTTOM TIME ") ' [5509] GOSUB 5000
            BASIC_BottomTime = VAL(InputValue)
            DIVERClearInputLine 14

            IF BASIC_BottomTime > 0 THEN
                BASIC_PA(1, 2) = BASIC_BottomTime
                BASIC_PA(1, 4) = BASIC_PA(1, 3) ' [5520]
                BASIC_PA(1, 5) = 2 ' [5530]
                DIVERBuildWorkStack ' [5550] GOSUB 5900
            ELSE
                ' [5515] A non-positive BOTTOM TIME assumes ASCEND, not WORK.
                BASIC_PA(1, 1) = 2
                BASIC_PA(1, 2) = BASIC_AR
                BASIC_PA(1, 4) = 0
                BASIC_PA(1, 5) = 5
            END IF

        CASE 4 ' [2110] GOSUB 5600 - DECOMPRESS at the current ceiling
            BASIC_PA(1, 2) = BASIC_DX ' [5610]
            IF BASIC_HT = 5 THEN BASIC_PA(1, 2) = BASIC_D5 ' [5615]
            BASIC_PA(1, 4) = BASIC_PA(1, 3) ' [5620]
            BASIC_PA(1, 5) = 2 ' [5640] ASCEND after the stop

        CASE 5 ' [2140] GOSUB 5700 - REST NEXT
            BEEP ' [5705]
            InputValue = DIVERReadInput$("FOR HOW LONG ") ' [5710] GOSUB 5000
            BASIC_M = VAL(InputValue)
            DIVERClearInputLine 24
            BASIC_PA(1, 2) = BASIC_M ' [5710] stored before M is adjusted
            IF BASIC_M < 2 * BASIC_TK THEN BASIC_M = 2 * BASIC_TK ' [5715]
            BASIC_PA(1, 4) = BASIC_PA(1, 3) ' [5720]
            BASIC_PA(1, 5) = 5 ' [5730]

        CASE ELSE
            BASIC_DiveRunning = 0
            CCScenario = "Stage 18 successor path not yet implemented"
    END SELECT
END SUB


SUB DIVERPredictiveActivityPrompt
    DIM Answer AS STRING
    DIM DefaultActivity AS STRING

    IF BASIC_CK <> 0 THEN EXIT SUB ' [3015]
    IF BASIC_CL < BASIC_ES(BASIC_EP, 2) - BASIC_IK THEN EXIT SUB ' [3010]
    IF BASIC_AL(BASIC_AL_scalar, 1) = 5 THEN
        BASIC_CK = 1 ' [3022]
        EXIT SUB
    END IF

    BASIC_CK = 1 ' [3025]
    IF BASIC_AL(BASIC_AL_scalar, 1) = 3 THEN DIVERGosub6200 ' [3017]
    SELECT CASE BASIC_AL(BASIC_AL_scalar, 5)
        CASE 1: DefaultActivity = "DESCEND"
        CASE 2: DefaultActivity = "ASCEND"
        CASE 3: DefaultActivity = "WORK"
        CASE 4: DefaultActivity = "DECOMPRESS"
        CASE 5: DefaultActivity = "REST"
    END SELECT
    BEEP
    ' [3031-3032]
    Answer = UCASE$(DIVERReadInput$("WHICH ACTIVITY REQUIRED (" + DefaultActivity + ") "))
    DIVERClearInputLine 48

    SELECT CASE Answer ' [3034-3036]
        CASE ""
            ' [3036] Leave NA=0. At the true boundary [1895] replaces it
            ' with the current activity's displayed stored default.
            BASIC_NA = 0
        CASE "ASCEND": BASIC_NA = 2
        CASE "WORK": BASIC_NA = 3
        CASE "DECOMPRESS": BASIC_NA = 4
        CASE "REST": BASIC_NA = 5
        CASE ELSE
            ' Source [3034-3036] exhausts the name scan and sets NA=0.
            ' [1895] therefore uses the displayed stored default for blank
            ' and for every unrecognised answer; neither condition is fatal.
            BASIC_NA = 0
    END SELECT
    BASIC_PromptAnswered = -1
END SUB


SUB DIVERBuildWorkStack
    DIM BASIC_I AS INTEGER
    DIM BASIC_J AS INTEGER
    DIM BASIC_K AS INTEGER
    DIM BASIC_L AS INTEGER
    DIM BASIC_M AS INTEGER
    DIM BASIC_TT AS SINGLE

    ' [5900-5999] Divide WORK at the dive-table boundaries crossed by the
    ' requested bottom time. PA remains a LIFO stack, as in the source.
    IF BASIC_AD < 10 THEN EXIT SUB ' [5905]
    BASIC_TT = BASIC_PA(1, 2) ' [5910]
    BASIC_I = INT((BASIC_PA(1, 3) - 7) / 2)
    IF BASIC_I > 21 THEN BASIC_I = 21 ' [5913]

    FOR BASIC_J = 1 TO 7 ' [5915-5930]
        IF BASIC_DT(BASIC_I, BASIC_J) = 999 THEN
            BASIC_DiveRunning = 0
            CCScenario = "[5931] WORK begins beyond the dive table"
            EXIT SUB
        END IF
        IF BASIC_CL <= BASIC_DT(BASIC_I, BASIC_J) THEN EXIT FOR
    NEXT BASIC_J

    FOR BASIC_K = 1 TO 7 ' [5945-5965]
        IF BASIC_DT(BASIC_I, BASIC_K) = 999 THEN
            BASIC_PA_scalar = -1 ' [5970]
            BASIC_DiveRunning = 0
            CCScenario = "[5970] WORK duration exceeds the dive table"
            EXIT SUB
        END IF
        IF BASIC_CL + BASIC_TT <= BASIC_DT(BASIC_I, BASIC_K) THEN EXIT FOR
    NEXT BASIC_K

    IF BASIC_J <> BASIC_K THEN
        BASIC_PA(1, 2) = BASIC_CL + BASIC_TT - BASIC_DT(BASIC_I, BASIC_K - 1) ' [5976]
        IF BASIC_K - BASIC_J > 1 THEN
            BASIC_M = BASIC_K - BASIC_J + 1
            FOR BASIC_L = BASIC_J + 1 TO BASIC_K - 1 ' [5981-5984]
                BASIC_M = BASIC_M - 1
                BASIC_PA(BASIC_M, 2) = BASIC_DT(BASIC_I, BASIC_L) - BASIC_DT(BASIC_I, BASIC_L - _
                    1)
            NEXT BASIC_L
        END IF

        BASIC_PA_scalar = BASIC_K - BASIC_J + 1 ' [5985]
        BASIC_PA(BASIC_PA_scalar, 2) = BASIC_DT(BASIC_I, BASIC_J) - BASIC_CL ' [5986]

        FOR BASIC_K = 2 TO BASIC_PA_scalar ' [5991-5997]
            BASIC_PA(BASIC_K, 1) = BASIC_PA(1, 1)
            BASIC_PA(BASIC_K, 3) = BASIC_PA(1, 3)
            BASIC_PA(BASIC_K, 4) = BASIC_PA(1, 4)
            BASIC_PA(BASIC_K, 5) = 3
        NEXT BASIC_K
    END IF

    BASIC_PA(1, 5) = 2 ' [5998] final stack successor is ASCEND
END SUB


SUB DIVERPlotCurrentProfileTick
    DIM BASIC_LP AS INTEGER
    DIM BASIC_LQ AS INTEGER
    DIM BASIC_MP AS INTEGER
    DIM BASIC_MQ AS INTEGER
    ' [6310] Source time-axis endpoints.
    BASIC_LP = INT(BASIC_AA * BASIC_XS) + 10
    BASIC_LQ = INT(BASIC_CL * BASIC_XS) + 10
    BASIC_LastLP = BASIC_LP
    BASIC_LastLQ = BASIC_LQ

    IF BASIC_AL(BASIC_AL_scalar, 1) = 3 THEN
        DIVERPlotCurrentWorkTick BASIC_LP, BASIC_LQ
        EXIT SUB
    END IF

    ' [6313] Source depth-axis endpoints.
    BASIC_MP = 140 - INT(BASIC_BB * BASIC_YS)
    BASIC_MQ = 140 - INT(BASIC_AD * BASIC_YS)

    BASIC_LastLP = BASIC_LP
    BASIC_LastLQ = BASIC_LQ
    BASIC_LastMP = BASIC_MP
    BASIC_LastMQ = BASIC_MQ

    ' [6314-6317] Retain the source's rightward and direction guards.
    IF BASIC_LQ < BASIC_LM THEN EXIT SUB
    BASIC_LM = BASIC_LQ
    IF BASIC_AL(BASIC_AL_scalar, 1) = 1 AND BASIC_MQ > BASIC_MP THEN EXIT SUB
    IF BASIC_AL(BASIC_AL_scalar, 1) = 2 AND BASIC_MP > BASIC_MQ THEN EXIT SUB

    ' [6320] Send the literal DIVER PLOT sequence to the synthesised terminal.
    ' The DIVER layer supplies coordinates only; CCDrawVector owns the raster.
    CCPlotBegin
    CCSend 6
    CCSend 32
    CCSend 29
    CCSend 2
    CCSend 253
    CCSend BASIC_LP
    CCSend BASIC_MP
    CCSend 242
    CCSend BASIC_LQ
    CCSend BASIC_MQ
    CCSend 255

    BASIC_VectorCount = BASIC_VectorCount + 1
END SUB


SUB DIVERPlotCurrentWorkTick (BASIC_LP AS INTEGER, BASIC_LQ AS INTEGER)
    DIM BASIC_X3 AS INTEGER
    DIM BASIC_Y3 AS INTEGER
    DIM BASIC_XX AS SINGLE
    DIM BASIC_Y2 AS INTEGER
    DIM BASIC_Y1 AS INTEGER
    DIM BASIC_C_scalar AS INTEGER
    DIM BASIC_L AS INTEGER
    DIM BASIC_CO AS INTEGER
    DIM BASIC_J AS INTEGER
    DIM BASIC_I AS INTEGER

    ' [6330] WORK remains at the pre-pass physical depth.
    BASIC_Y3 = INT(140 - BASIC_BB * BASIC_YS)
    BASIC_LastMP = BASIC_Y3
    BASIC_LastMQ = BASIC_Y3

    FOR BASIC_X3 = BASIC_LP TO BASIC_LQ ' [6331]
        IF BASIC_X3 > BASIC_LM THEN ' [6332]
            BASIC_LM = BASIC_X3
            BASIC_XX = (BASIC_X3 - 10) / BASIC_XS - BASIC_TK ' [6333]
            IF BASIC_X3 = 32 OR BASIC_X3 = 33 THEN CALL CCCaptureWorkCellTrace((BASIC_X3 - 32) _
                * 4 + 1)
            BASIC_Y2 = 140 ' [6345]
            BASIC_C_scalar = 1
            BASIC_L = 1 ' [6346]
            BASIC_CO = 1

            FOR BASIC_J = 1 TO 7 ' [6350]
                CCPlotBegin ' [6355] PLOT 30,20
                CCSend 30
                CCSend 20

                BASIC_I = BASIC_L ' [6360-6375]
                DO WHILE BASIC_I <= 21
                    IF BASIC_DT(BASIC_I, BASIC_J) = 999 OR BASIC_DT(BASIC_I, BASIC_J) < _
                        BASIC_XX THEN EXIT DO
                    BASIC_I = BASIC_I + 1
                LOOP

                BASIC_Y1 = INT(140 - (2 * BASIC_I + 8) * BASIC_YS) ' [6380]
                BASIC_Y1 = BASIC_Y1 + 2 ' [6381]
                IF BASIC_Y1 = 42 THEN BASIC_Y1 = 40
                IF BASIC_Y1 < 40 THEN BASIC_Y1 = 40 ' [6385]

                ' [6390-6400]
                IF NOT (BASIC_Y3 < BASIC_Y1 OR BASIC_Y3 > BASIC_Y2) THEN BASIC_CO = _
                    BASIC_C_scalar

                IF BASIC_C_scalar <> 1 THEN ' [6500-6525]
                    CCPlotBegin
                    CCSend 29
                    CCSend BASIC_C(BASIC_C_scalar)
                    CCPlotBegin
                    CCSend 2
                    CCSend 246
                    CCSend BASIC_Y1
                    CCSend BASIC_X3
                    CCSend BASIC_Y2
                    CCSend 255
                    BASIC_BandBarCount = BASIC_BandBarCount + 1
                END IF

                IF BASIC_Y1 = 40 OR BASIC_C_scalar = 7 THEN EXIT FOR ' [6540]
                IF BASIC_I <= 21 THEN
                    IF BASIC_DT(BASIC_I, BASIC_J) = 999 THEN EXIT FOR ' [6541]
                END IF
                BASIC_Y2 = BASIC_Y1 - 1 ' [6550]
                BASIC_C_scalar = BASIC_C_scalar + 1 ' [6560]
                BASIC_L = BASIC_I ' [6565]
            NEXT BASIC_J

            IF BASIC_X3 = 32 OR BASIC_X3 = 33 THEN CALL CCCaptureWorkCellTrace((BASIC_X3 - 32) _
                * 4 + 2)

            ' [6590] Restore the selected band background and black foreground.
            CCPlotBegin
            CCSend 30
            CCSend BASIC_C(BASIC_CO)
            CCSend 29
            CCSend 16
            CCSend 29
            IF BASIC_X3 = 32 OR BASIC_X3 = 33 THEN CALL CCCaptureWorkCellTrace((BASIC_X3 - 32) _
                * 4 + 3)

            ' [6591] Plot the diver's WORK-position cell at this X3 column.
            CCPlotBegin
            CCSend 2
            CCSend 253
            CCSend BASIC_X3
            CCSend BASIC_Y3
            CCSend 255
            IF BASIC_X3 = 32 OR BASIC_X3 = 33 THEN CALL CCCaptureWorkCellTrace((BASIC_X3 - 32) _
                * 4 + 4)
            BASIC_WorkDotCount = BASIC_WorkDotCount + 1

        END IF
    NEXT BASIC_X3 ' [6593]
END SUB


SUB DIVERGosub6200
    DIM Chars AS STRING
    DIM Index AS INTEGER

    ' [6200-6240] A predictive prompt during WORK first refreshes the
    ' third Dive Monitor row with AIR OK in green.
    Chars = "AIR OK"
    FOR Index = 1 TO 6
        DIVERDisplayMonitorCell 12 + Index, ASC(MID$(Chars, Index, 1)), 1, 0
    NEXT Index
END SUB


SUB DIVERGosub6250
    DIM BASIC_I AS SINGLE
    DIM BASIC_ID AS INTEGER
    DIM BASIC_VA AS INTEGER

    ' [6250-6299] Display the decompression requirement at this depth.
    IF BASIC_HT <= 5 THEN EXIT SUB ' [6257]

    ' [6260] The source assigns I but subsequently prints D5. Preserve that
    ' apparently unused assignment rather than silently modernising it.
    BASIC_I = BASIC_D5
    IF BASIC_HT = 10 THEN BASIC_I = BASIC_DX

    BASIC_ID = 13: BASIC_VA = 53: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0 ' 5
    BASIC_ID = 14: BASIC_VA = 77: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0 ' M
    BASIC_ID = 15: BASIC_VA = 32: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = 16
    BASIC_VA = INT(BASIC_D5 / 10) + 48
    IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = 17
    BASIC_VA = BASIC_D5 - INT(BASIC_D5 / 10) * 10 + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = 18: BASIC_VA = 58: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0 ' :
END SUB


SUB DIVERGosub6100
    DIM BASIC_I AS INTEGER
    DIM BASIC_J AS INTEGER
    DIM BASIC_L AS INTEGER
    DIM FoundJ AS INTEGER
    DIM FoundL AS INTEGER

    BASIC_I = INT((BASIC_AL(BASIC_AL_scalar, 3) - 7) / 2) ' [6125]
    IF BASIC_I < 1 THEN BASIC_I = 1 ' [6127]

    FOR BASIC_J = 1 TO 7 ' [6135-6150]
        IF BASIC_DT(BASIC_I, BASIC_J) = 999 THEN EXIT FOR
        IF BASIC_WE <= BASIC_DT(BASIC_I, BASIC_J) THEN
            FoundJ = -1
            EXIT FOR
        END IF
    NEXT BASIC_J
    IF NOT FoundJ THEN
        BASIC_DiveRunning = 0
        CCScenario = "[6181] OUT OF RANGE in GOSUB 6100"
        EXIT SUB
    END IF

    FOR BASIC_L = 1 TO 7 ' [6165-6180]
        IF BASIC_DT(BASIC_I, BASIC_L) = 999 THEN EXIT FOR
        IF BASIC_AL(BASIC_AL_scalar, 7) <= BASIC_DT(BASIC_I, BASIC_L) THEN
            FoundL = -1
            EXIT FOR
        END IF
    NEXT BASIC_L
    IF NOT FoundL THEN
        BASIC_DiveRunning = 0
        CCScenario = "[6181] OUT OF RANGE in GOSUB 6100"
        EXIT SUB
    END IF

    ' [6851] GOSUB 6850 later reuses these final I and L values.
    BASIC_I6 = BASIC_I
    BASIC_L2 = BASIC_L
    BASIC_WE = BASIC_AL(BASIC_AL_scalar, 7) ' [6185]
    IF BASIC_AL(BASIC_AL_scalar, 3) > 20 AND BASIC_L > 1 THEN BASIC_DX = 5 ' [6190]
    IF BASIC_DX <> 0 THEN BASIC_HT = 10 ' [6191]
    IF BASIC_J = BASIC_L THEN EXIT SUB ' [6193]
    BASIC_D5 = BASIC_D5 + (BASIC_L - BASIC_J) * 5 ' [6194]
    IF BASIC_DX = 0 THEN BASIC_HT = 5 ' [6195]
END SUB


SUB DIVERGosub6950
    DIM Chars AS STRING
    DIM I AS INTEGER

    IF BASIC_HT = 0 THEN EXIT SUB ' [6955]
    IF BASIC_DX <> 0 THEN
        Chars = "STOP10"
    ELSE
        Chars = "STOP 5"
    END IF
    FOR I = 1 TO 6 ' [6956-6962]
        DIVERDisplayMonitorCell I, ASC(MID$(Chars, I, 1)), 0, 0
    NEXT I
END SUB


SUB DIVERWriteBoundTime (BASIC_II AS INTEGER, BASIC_NN AS SINGLE)
    DIM BASIC_ID AS INTEGER
    DIM BASIC_J AS SINGLE
    DIM BASIC_VA AS INTEGER

    BASIC_ID = BASIC_II + 7 ' [6855]
    BASIC_VA = INT(BASIC_NN / 100) + 48
    IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = BASIC_II + 8 ' [6856]
    BASIC_J = BASIC_NN - INT(BASIC_NN / 100) * 100
    BASIC_VA = INT(BASIC_J / 10) + 48
    IF BASIC_VA = 48 AND BASIC_NN < 100 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = BASIC_II + 9 ' [6857]
    BASIC_VA = INT(BASIC_J - INT(BASIC_J / 10) * 10) + 48
    IF BASIC_VA = 48 AND BASIC_NN < 10 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = BASIC_II + 10 ' [6858]
    BASIC_VA = 58
    IF BASIC_NN = 0 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_J = (BASIC_NN - INT(BASIC_NN)) * 60
    BASIC_ID = BASIC_II + 11 ' [6859]
    BASIC_VA = INT(BASIC_J / 10) + 48
    IF BASIC_NN = 0 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = BASIC_II + 12 ' [6860]
    BASIC_VA = INT(BASIC_J - INT(BASIC_J / 10) * 10) + 48
    IF BASIC_NN = 0 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0
END SUB


SUB DIVERGosub6850
    DIM BASIC_J AS SINGLE
    DIM BASIC_NN AS SINGLE
    DIM BASIC_VA AS INTEGER

    IF BASIC_AL(BASIC_AL_scalar, 7) <= BASIC_DT(BASIC_I6, 1) THEN ' [6852]
        BASIC_NN = BASIC_DT(BASIC_I6, 1) - BASIC_CL ' [6854]
        IF BASIC_AD < 10 THEN BASIC_NN = 0
        DIVERWriteBoundTime 0, BASIC_NN
        EXIT SUB
    END IF

    DIVERDisplayMonitorCell 7, 84, 0, 0 ' [6872] T
    BASIC_J = BASIC_D5 + BASIC_DX ' [6873]
    BASIC_VA = INT(BASIC_J / 10) + 48
    IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell 8, BASIC_VA, 0, 0
    BASIC_VA = INT(BASIC_J - INT(BASIC_J / 10) * 10) + 48
    DIVERDisplayMonitorCell 9, BASIC_VA, 0, 0
    DIVERDisplayMonitorCell 10, 58, 0, 0
    DIVERDisplayMonitorCell 11, 58, 0, 0
    DIVERDisplayMonitorCell 12, 58, 0, 0

    BASIC_NN = BASIC_DT(BASIC_I6, BASIC_L2) - BASIC_CL ' [6881]
    IF BASIC_NN < 0 THEN BASIC_NN = 0
    DIVERWriteBoundTime 6, BASIC_NN
END SUB


FUNCTION DIVERReadInput$ (PromptText AS STRING)
    DIM Buffer AS STRING
    DIM Character AS STRING
    DIM KeyValue AS LONG
    DIM CursorColumn AS INTEGER
    DIM FinishedInput AS INTEGER

    ' [5005,5020,5030] Restore black-on-cyan text, position at Home, print
    ' M$ without a newline, and
    ' collect the keyboard response. The visible characters are written into
    ' the synthesised terminal rather than by QB64's native PRINT statement.
    BASIC_InputActive = -1
    CCPlotBegin
    CCSend 6
    CCSend 48
    CCPlotBegin
    CCSend 3
    CCSend 0
    CCSend 0
    CCWriteText PromptText

    DO
        CCRender
        _DISPLAY

        KeyValue = _KEYHIT
        SELECT CASE KeyValue
            CASE 15360 ' F2: host-only diagnostics while input owns _KEYHIT.
                DIVERCopyDiagnostics

            CASE 13
                FinishedInput = -1

            CASE 8
                IF LEN(Buffer) > 0 THEN
                    Buffer = LEFT$(Buffer, LEN(Buffer) - 1)
                    CursorColumn = LEN(PromptText) + LEN(Buffer)
                    CCPlotBegin
                    CCSend 3
                    CCSend CursorColumn
                    CCSend 0
                    CCWriteText " "
                    CCPlotBegin
                    CCSend 3
                    CCSend CursorColumn
                    CCSend 0
                END IF

            CASE 27
                SYSTEM

            CASE 32 TO 126
                IF LEN(Buffer) < 40 THEN
                    Character = UCASE$(CHR$(KeyValue))
                    Buffer = Buffer + Character
                    CCWriteText Character
                END IF
        END SELECT

        _LIMIT 30
    LOOP UNTIL FinishedInput

    BASIC_InputActive = 0
    DIVERReadInput$ = Buffer
END FUNCTION


SUB DIVERClearInputLine (CharacterCount AS INTEGER)
    ' [5040-5051] and [1305-1306] clear the completed prompt line and Home it.
    CCPlotBegin
    CCSend 3
    CCSend 0
    CCSend 0
    CCWriteText STRING$(CharacterCount, 32)
    CCPlotBegin
    CCSend 3
    CCSend 0
    CCSend 0
END SUB


SUB DIVERGosub6600
    DIM BASIC_ID AS INTEGER
    DIM BASIC_VA AS INTEGER
    DIM BASIC_FL AS INTEGER

    ' [6600-6699] Initial depth gauge. AD=0 and AY=-1 make the first call run.
    CCPlotBegin
    CCSend 29
    IF BASIC_AD = BASIC_AY THEN EXIT SUB

    BASIC_ID = 19
    BASIC_FL = 0
    BASIC_VA = INT(BASIC_AD / 10) + 48
    IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, BASIC_FL

    BASIC_ID = 20
    BASIC_VA = BASIC_AD - INT(BASIC_AD / 10) * 10 + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, BASIC_FL

    BASIC_ID = 21
    BASIC_VA = (BASIC_AD - INT(BASIC_AD)) * 10
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, BASIC_FL
    BASIC_AY = BASIC_AD
END SUB


SUB DIVERGosub6700
    DIM BASIC_ID AS INTEGER
    DIM BASIC_VA AS INTEGER

    ' [6700-6745] Initial air-left gauge. This remains the source's explicitly
    ' described dummy display rate; it is not a physiological calculation.
    BASIC_ID = 22
    BASIC_VA = 13 - INT(BASIC_CL * BASIC_XS / 10)
    IF BASIC_VA < 0 THEN EXIT SUB
    IF BASIC_LA = BASIC_VA THEN EXIT SUB
    BASIC_LA = BASIC_VA
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, 0
END SUB


SUB DIVERGosub6750
    DIM BASIC_I AS INTEGER
    DIM BASIC_II AS INTEGER
    DIM BASIC_J AS INTEGER
    DIM BASIC_NN AS SINGLE

    ' [6750-6799] NOSTOP time or time to the next table boundary.
    BASIC_I = BASIC_AL(BASIC_AL_scalar, 1)
    IF BASIC_I <> 1 AND BASIC_I <> 3 THEN EXIT SUB
    IF BASIC_AD > BASIC_WM THEN BASIC_WM = BASIC_AD
    BASIC_J = INT((BASIC_WM - 7) / 2)
    IF BASIC_J < 1 THEN BASIC_J = 1
    BASIC_NS = BASIC_DT(BASIC_J, 1) - BASIC_CL - BASIC_TK
    IF BASIC_WM < 10 THEN BASIC_NS = 0
    BASIC_II = 0: BASIC_NN = BASIC_NS
    IF BASIC_NS < 0 THEN
        FOR BASIC_I = 2 TO 7
            IF BASIC_DT(BASIC_J, BASIC_I) <> 999 AND BASIC_DT(BASIC_J, BASIC_I) > BASIC_CL THEN _
                EXIT FOR
        NEXT BASIC_I
        IF BASIC_I > 7 THEN
            BASIC_DiveRunning = 0
            CCScenario = "OUT OF RANGE at [6762-6763]"
            EXIT SUB
        END IF
        BASIC_NN = BASIC_DT(BASIC_J, BASIC_I) - BASIC_CL - BASIC_TK
        BASIC_II = 6
    END IF
    DIVERWriteBoundTime BASIC_II, BASIC_NN
END SUB


SUB DIVERGosub6800
    DIM BASIC_CO AS INTEGER
    DIM BASIC_FL AS INTEGER
    DIM BASIC_ID AS INTEGER
    DIM BASIC_VA AS INTEGER
    DIM BASIC_I AS SINGLE
    DIM BASIC_Seconds AS SINGLE

    ' [6800-6849] Count down and display total decompression requirements.
    BASIC_CO = 0: BASIC_FL = 0 ' [6804]

    BASIC_ID = 7: BASIC_VA = 84 ' [6805] T
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    ' [6810-6820] HT identifies the active 10 m or 5 m requirement.
    IF BASIC_HT = 10 THEN
        BASIC_DX = BASIC_DX - BASIC_TK
    ELSE
        BASIC_D5 = BASIC_D5 - BASIC_TK
    END IF

    BASIC_I = BASIC_D5 + BASIC_DX ' [6825]

    BASIC_ID = 8
    BASIC_VA = INT(BASIC_I / 10) + 48
    IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    BASIC_ID = 9 ' [6830]
    BASIC_VA = INT(BASIC_I - INT(BASIC_I / 10) * 10) + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    BASIC_ID = 10: BASIC_VA = 58 ' [6835] colon
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    BASIC_Seconds = (BASIC_I - INT(BASIC_I)) * 60 ' [6840]
    BASIC_ID = 11
    ' The source passes these numeric values as plot bytes. INT expresses the
    ' original byte conversion explicitly; it does not change the arithmetic.
    BASIC_VA = INT(BASIC_Seconds / 10) + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    BASIC_ID = 12 ' [6845]
    BASIC_VA = INT(BASIC_Seconds - INT(BASIC_Seconds / 10) * 10) + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
END SUB


SUB DIVERGosub7500
    DIM BASIC_CO AS INTEGER
    DIM BASIC_FL AS INTEGER
    DIM BASIC_ID AS INTEGER
    DIM BASIC_VA AS INTEGER

    ' [7500-7549] Subroutine used when a DECOMPRESS activity finishes.
    BASIC_CO = 0: BASIC_FL = 0 ' [7502]

    BASIC_VA = 32 ' [7505]
    FOR BASIC_ID = 7 TO 12
        DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    NEXT BASIC_ID

    IF BASIC_HT = 10 THEN ' [7510]
        BASIC_ID = 5: BASIC_VA = 32 ' [7536]
        DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
        BASIC_ID = 6: BASIC_VA = 53 ' [7545]
        DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    ELSE
        BASIC_CO = 1 ' [7515]
        ' [7520] A
        BASIC_ID = 1: BASIC_VA = 65: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, _
            BASIC_FL
        ' S
        BASIC_ID = 2: BASIC_VA = 83: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, _
            BASIC_FL
        ' [7525] C
        BASIC_ID = 3: BASIC_VA = 67: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, _
            BASIC_FL
        ' E
        BASIC_ID = 4: BASIC_VA = 69: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, _
            BASIC_FL
        ' [7530] N
        BASIC_ID = 5: BASIC_VA = 78: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, _
            BASIC_FL
        ' D
        BASIC_ID = 6: BASIC_VA = 68: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, _
            BASIC_FL
    END IF

    BASIC_HT = BASIC_HT - 5 ' [7549]
END SUB


SUB DIVERGosub8000
    DIM BASIC_CO AS INTEGER, BASIC_FL AS INTEGER, BASIC_ID AS INTEGER
    DIM BASIC_I AS SINGLE, BASIC_VA AS INTEGER

    ' [8005-8006]
    CCPlotBegin: CCSend 15: CCSend 6: CCSend 7
    CCPlotBegin: CCSend 3: CCSend 69: CCSend 1: CCWriteText "MEMORY"
    ' [8010]
    BASIC_AD = BASIC_WD: DIVERGosub6600: DIVERGosub6700
    ' [8020-8060]
    BASIC_CO = 1: BASIC_FL = 0
    BASIC_ID = 1: BASIC_VA = INT(BASIC_BT / 100) + 48: IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 2: BASIC_I = INT(BASIC_BT - INT(BASIC_BT / 100) * 100): BASIC_VA = INT(BASIC_I / _
        10) + 48: IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 3: BASIC_VA = BASIC_I - INT(BASIC_I / 10) * 10 + 48: DIVERDisplayMonitorCell _
        BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 4: BASIC_VA = 58: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 5: BASIC_I = (BASIC_BT - INT(BASIC_BT)) * 60: BASIC_VA = INT(BASIC_I / 10) + 48: _
        DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 6: BASIC_VA = BASIC_I - INT(BASIC_I / 10) * 10 + 48: DIVERDisplayMonitorCell _
        BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    ' [8062-8073]
    IF BASIC_WM < 10 THEN BASIC_NS = 0
    IF BASIC_NS >= 0 THEN
        BASIC_VA = 32
        FOR BASIC_ID = 7 TO 12: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL: _
            NEXT BASIC_ID
        IF BASIC_NS <> 0 THEN
            BASIC_CO = 0
            BASIC_ID = 13: BASIC_VA = 82: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, _
                BASIC_FL
            BASIC_ID = 14: BASIC_VA = 78: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, _
                BASIC_FL
            BASIC_ID = 15: BASIC_VA = 83: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, _
                BASIC_FL
            BASIC_ID = 16: BASIC_VA = INT(BASIC_NS / 100) + 48: IF BASIC_VA = 48 THEN BASIC_VA _
                = 32
            DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
            BASIC_ID = 17: BASIC_I = BASIC_NS - INT(BASIC_NS / 100) * 100: BASIC_VA = _
                INT(BASIC_I / 10) + 48: IF BASIC_NS < 100 AND BASIC_VA = 48 THEN BASIC_VA = 32
            DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
            BASIC_ID = 18: BASIC_VA = BASIC_I - INT(BASIC_I / 10) * 10 + 48: _
                DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
        END IF
        EXIT SUB
    END IF
    ' [8074-8090]
    BASIC_D5 = BASIC_E5: BASIC_DX = BASIC_EX: BASIC_CO = 1
    BASIC_ID = 7: BASIC_VA = 49: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 8: BASIC_VA = 48: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 9: BASIC_VA = 77: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_CO = 0
    BASIC_ID = 10: BASIC_VA = INT(BASIC_DX / 10) + 48: IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 11: BASIC_VA = BASIC_DX - INT(BASIC_DX / 10) * 10 + 48: DIVERDisplayMonitorCell _
        BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 12: BASIC_VA = 58: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_CO = 1
    BASIC_ID = 13: BASIC_VA = 53: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 14: BASIC_VA = 77: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 15: BASIC_VA = 32: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_CO = 0
    BASIC_ID = 16: BASIC_VA = INT(BASIC_D5 / 10) + 48: IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 17: BASIC_VA = BASIC_D5 - INT(BASIC_D5 / 10) * 10 + 48: DIVERDisplayMonitorCell _
        BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 18: BASIC_VA = 32: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
END SUB


SUB DIVERDisplayDepthTrend (BASIC_VA AS INTEGER, BASIC_FL AS INTEGER)
    DIM BASIC_I AS INTEGER

    ' [7200-7204] Clear all ten depth-trend bars in black.
    CCPlotBegin
    CCSend 6
    CCSend 0
    CCSend 2
    CCSend 250
    CCSend 152
    FOR BASIC_I = 1 TO 10
        CCPlotBegin
        CCSend 166 - 2 * BASIC_I
        CCSend 155
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255

    ' [7205] VA=0 on the initial call, so no red bars are repainted.
    IF BASIC_VA = 0 THEN EXIT SUB

    ' [7210-7240] Repaint INT(VA) bars in red, or blinking red when FL=64.
    CCPlotBegin
    CCSend 6
    CCSend 1 + BASIC_FL
    CCSend 2
    CCSend 250
    CCSend 152
    FOR BASIC_I = 1 TO BASIC_VA
        CCPlotBegin
        CCSend 166 - 2 * BASIC_I
        CCSend 155
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255
END SUB


SUB DIVERDisplayAirGauge (BASIC_VA AS INTEGER, BASIC_FL AS INTEGER)
    DIM BASIC_I AS INTEGER

    ' [7301-7304] Clear all eighteen air-gauge positions in black.
    CCPlotBegin
    CCSend 6
    CCSend 0
    CCSend 2
    CCSend 250
    CCSend 133
    FOR BASIC_I = 1 TO 18
        CCPlotBegin
        CCSend 183 - 2 * BASIC_I
        CCSend 134
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255

    ' [7305-7308] Repaint the lower three positions in magenta.
    CCPlotBegin
    CCSend 6
    CCSend 5
    CCSend 2
    CCSend 250
    CCSend 133
    FOR BASIC_I = 16 TO 18
        CCPlotBegin
        CCSend 185 - 2 * BASIC_I
        CCSend 134
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255

    ' [7310-7342] Repaint INT(VA) positions in green.
    IF INT(BASIC_VA) = 0 THEN EXIT SUB
    CCPlotBegin
    CCSend 6
    CCSend 2 + BASIC_FL
    CCSend 2
    CCSend 250
    CCSend 133
    FOR BASIC_I = 1 TO BASIC_VA
        CCPlotBegin
        CCSend 153 + 2 * BASIC_I
        CCSend 134
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255
END SUB


SUB DIVERWriteVerticalLegend
    DIM SavedMode AS INTEGER
    DIM SavedColumn AS INTEGER
    DIM SavedRow AS INTEGER
    DIM SavedDirection AS INTEGER
    DIM SavedLarge AS INTEGER

    ' [1261-1263] The source enters X Point Plot at (14,15), selects vertical
    ' visible-cursor writing with two ESC-J sequences, then PRINTs the legend.
    ' Literal execution of this sequence in CCEMU leaves Graphic Plot Mode
    ' active and treats the PRINT bytes as scattered plot data, producing no
    ' text. The surviving photograph instead establishes the original visible
    ' result: small vertical characters spanning roughly the 5 m to 30 m ticks.
    ' The precise 8001 plot-to-text hand-off cannot therefore be generalised
    ' from the Compucolor II emulator.
    '
    ' This adapter therefore writes the verified vertical text through
    ' the terminal character-cell renderer at column 3 and the corresponding
    ' established start row. It also consumes the setup point so it is not
    ' exposed as an isolated four-pixel mark beneath the time axis.
    SavedMode = CCState.Mode
    SavedColumn = CCState.TextColumn
    SavedRow = CCState.TextRow
    SavedDirection = CCState.WriteDirection
    SavedLarge = CCState.LargeCharacters

    CCClearGraphicsBlock 14, 15
    CCState.Mode = CC_TEXT_MODE
    CCState.TextColumn = 3
    CCState.TextRow = 15
    CCState.WriteDirection = CC_WRITE_VERTICAL
    ' Use the photographically established small-character result. This is an
    ' explicit compatibility adapter, not a claim about CCEMU's failed path.
    CCState.LargeCharacters = 0
    CCWriteText "5 METRE UNITS"

    CCState.Mode = SavedMode
    CCState.TextColumn = SavedColumn
    CCState.TextRow = SavedRow
    CCState.WriteDirection = SavedDirection
    CCState.LargeCharacters = SavedLarge
END SUB


SUB DIVERDisplayMonitorCell (BASIC_ID AS INTEGER, BASIC_VA AS INTEGER, BASIC_CO AS INTEGER, _
    BASIC_FL AS INTEGER)
    DIM GaugeHandled AS INTEGER

    ' Translation of the GOSUB 7000 paths required by IDs 1-22.

    ' [7100] IF FL=1 THEN FL=64
    IF BASIC_FL = 1 THEN BASIC_FL = 64

    ' [7110] PLOT 14
    CCPlotBegin
    CCSend 14

    ' [7120,7300-7342] ID=22 is the air-left bar gauge.
    IF BASIC_ID = 22 THEN
        DIVERDisplayAirGauge BASIC_VA, BASIC_FL
        GaugeHandled = -1
    END IF

    ' [7130,7200-7240] ID=21 is the fractional-depth trend gauge.
    IF BASIC_ID = 21 AND NOT GaugeHandled THEN
        DIVERDisplayDepthTrend BASIC_VA, BASIC_FL
        GaugeHandled = -1
    END IF

    IF GaugeHandled THEN
        ' [7440-7451] Common gauge cleanup and return.
        CCPlotBegin
        CCSend 15
        CCPlotBegin
        CCSend 3
        CCSend 80
        CCSend 0
        EXIT SUB
    END IF

    IF BASIC_ID >= 19 THEN
        ' [7131,7250] Depth digits use CCI 1 and columns 57+ID on row 4.
        CCPlotBegin
        CCSend 6
        CCSend 1 + BASIC_FL
        CCSend 3
        CCSend 57 + BASIC_ID
        CCSend 4
    ELSEIF BASIC_ID >= 13 THEN
        ' [7135,7160] IDs 13-18 use columns 56+ID on row 9.
        CCPlotBegin
        CCSend 3
        CCSend 56 + BASIC_ID
        CCSend 9

        ' [7165-7168] CO selects green or yellow for rows two and three.
        CCPlotBegin
        CCSend 6
        IF BASIC_CO = 1 THEN
            CCSend 2 + BASIC_FL
        ELSE
            CCSend 3 + BASIC_FL
        END IF
    ELSEIF BASIC_ID >= 7 THEN
        ' [7140,7150] IDs 7-12 use columns 62+ID on row 7.
        CCPlotBegin
        CCSend 3
        CCSend 62 + BASIC_ID
        CCSend 7

        ' [7165-7168] CO selects green or yellow for rows two and three.
        CCPlotBegin
        CCSend 6
        IF BASIC_CO = 1 THEN
            CCSend 2 + BASIC_FL
        ELSE
            CCSend 3 + BASIC_FL
        END IF
    ELSE
        ' [7145] IDs 1-6 use columns 68+ID on row 4.
        CCPlotBegin
        CCSend 3
        CCSend 68 + BASIC_ID
        CCSend 4

        ' [7147-7149] CO selects green or magenta.
        CCPlotBegin
        CCSend 6
        IF BASIC_CO = 1 THEN
            CCSend 2 + BASIC_FL
        ELSE
            CCSend 5 + BASIC_FL
        END IF
    END IF

    ' [7170-7180] Clamp to a printable character and PLOT VA.
    IF BASIC_VA > 95 THEN BASIC_VA = 63
    IF BASIC_VA < 32 THEN BASIC_VA = 63
    CCPlotBegin
    CCSend BASIC_VA

    ' [7440-7451] Restore normal characters and move the cursor off-screen.
    CCPlotBegin
    CCSend 15
    CCPlotBegin
    CCSend 3
    CCSend 80
    CCSend 0
END SUB


FUNCTION CCTextSlice$ (StartColumn AS INTEGER, Row AS INTEGER, CharacterCount AS INTEGER)
    DIM Index AS INTEGER
    DIM Column AS INTEGER
    DIM CharacterCode AS INTEGER
    DIM Result AS STRING

    FOR Index = 0 TO CharacterCount - 1
        Column = StartColumn + Index
        CharacterCode = 32
        IF Column >= 0 AND Column < CC_TEXT_COLS AND Row >= 0 AND Row < CC_TEXT_ROWS THEN
            IF CCCellKind(Column, Row) = CC_CELL_TEXT THEN CharacterCode = CCTextCode(Column, _
                Row)
        END IF
        IF CharacterCode < 32 OR CharacterCode > 126 THEN CharacterCode = 63
        Result = Result + CHR$(CharacterCode)
    NEXT Index

    CCTextSlice$ = Result
END FUNCTION
