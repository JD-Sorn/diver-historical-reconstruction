aption _Explicit

' DIVER_QB64_STAGE18_v03.bas
'
' Stage 18 v03 completes REST and translates [8000-8100] MEMORY at dive end.
' It retains the passed Stage 17 boundary, executes REST's five-minute surface
' track, dispatches REST at CL=49.75, and ends after the original MEMORY display.
' [3530] now calls the complete [6750-6799] state/display subroutine required
' by [8062-8074]; the DIVER arithmetic and PLOT coordinates remain unchanged.
' The first literal REST point uses the same blue-left-edge join treatment as
' the accepted first DECOMPRESS point; no REST points or vectors are suppressed.
' C still copies diagnostics.
' Stage 12 retains Stage 8 v06's accepted white-gap dash/space result and
' compensates unset blocks above the WORK track with explicit graph blue,
' preventing the shared-cell background from creating an upward white stub.
' It also applies the established complete-column raster grouping to ASCEND:
' the literal [6320] coordinates are retained, but a rise is displayed in the
' next plot column instead of being divided across two columns by Bresenham.
' QB64's four-pixel expansion makes diagonally adjacent complete cells fuse
' into a false staircase. A one-screen-pixel graph-blue left edge separates
' successive ASCEND strokes while the first joined cell remains full width.
' The [6320] origin at (LP,MP) is retained as vector state but is not also
' painted as a separate point during regrouped ASCEND; doing both created the
' erroneous leftward black stubs seen in v02-v04.
'
' Target logical display:
'   80 x 48 character cells
'   160 x 192 graphics blocks (2 x 4 blocks per character cell)
'
' QB64-PE: https://www.qb64phoenix.com/

Const CC_TEXT_COLS = 80
Const CC_TEXT_ROWS = 48
Const CC_GFX_COLS = 160
Const CC_GFX_ROWS = 192

Const CC_TEXT_MODE = 0
Const CC_PLOT_MODE = 1

Const CC_CELL_TEXT = 0
Const CC_CELL_GRAPHICS = 1
Const CC_CELL_LARGE_CONTINUATION = 2

Const CC_PENDING_NONE = 0
Const CC_PENDING_CCI = 6
Const CC_PENDING_CURSOR_X = 301
Const CC_PENDING_CURSOR_Y = 302
Const CC_PENDING_ESCAPE = 27

Const CC_WRITE_HORIZONTAL = 0
Const CC_WRITE_VERTICAL = 1

' The logical Compucolor graphics block is deliberately rectangular here.
' Four screen pixels across and two down give an 8 x 8 normal character cell.
Const CC_BLOCK_W = 4
Const CC_BLOCK_H = 2
Const CC_DISPLAY_W = CC_GFX_COLS * CC_BLOCK_W
Const CC_DISPLAY_H = CC_GFX_ROWS * CC_BLOCK_H
Const CC_PANEL_W = 430
Const CC_WINDOW_W = CC_DISPLAY_W + CC_PANEL_W
Const CC_WINDOW_H = 620

Type CCStateType
    Mode As Integer
    Pending As Integer
    PendingX As Integer

    PlotSubmode As Integer
    PlotForceData As Integer

    TextColumn As Integer
    TextRow As Integer
    WriteDirection As Integer

    Foreground As Integer
    Background As Integer
    Flag As Integer
    LargeCharacters As Integer
    ColourTarget As Integer

    PointX As Integer
    PointY As Integer
    BarOrigin As Integer
    BarOther As Integer

    SuppressedTextBytes As Long
    UnsupportedPlotBytes As Long
End Type

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
DECLARE SUB DIVERDisplayMonitorCell (BASIC_ID AS INTEGER, BASIC_VA AS INTEGER, BASIC_CO AS INTEGER, BASIC_FL AS INTEGER)
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
DECLARE SUB CCSendPlot6 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, F AS INTEGER)
DECLARE SUB CCSendPlot7 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, F AS INTEGER, G AS INTEGER)
DECLARE FUNCTION CCWrapX% (Value AS INTEGER)
DECLARE FUNCTION CCWrapY% (Value AS INTEGER)
DECLARE FUNCTION CCCountGraphicsBlocks& ()
DECLARE FUNCTION CCTextAt% (Column AS INTEGER, Row AS INTEGER, CharacterCode AS INTEGER)
DECLARE FUNCTION CCTextSlice$ (StartColumn AS INTEGER, Row AS INTEGER, CharacterCount AS INTEGER)

Dim Shared CCState As CCStateType

Dim Shared CCCellKind(0 To CC_TEXT_COLS - 1, 0 To CC_TEXT_ROWS - 1) As Integer
Dim Shared CCTextCode(0 To CC_TEXT_COLS - 1, 0 To CC_TEXT_ROWS - 1) As Integer
Dim Shared CCTextForeground(0 To CC_TEXT_COLS - 1, 0 To CC_TEXT_ROWS - 1) As Integer
Dim Shared CCTextBackground(0 To CC_TEXT_COLS - 1, 0 To CC_TEXT_ROWS - 1) As Integer
Dim Shared CCTextBlink(0 To CC_TEXT_COLS - 1, 0 To CC_TEXT_ROWS - 1) As Integer
Dim Shared CCTextLarge(0 To CC_TEXT_COLS - 1, 0 To CC_TEXT_ROWS - 1) As Integer
Dim Shared CCTextInputScale(0 To CC_TEXT_COLS - 1, 0 To CC_TEXT_ROWS - 1) As Integer

Dim Shared CCGraphicsColour(0 To CC_GFX_COLS - 1, 0 To CC_GFX_ROWS - 1) As Integer
Dim Shared CCAscendCell(0 To CC_GFX_COLS - 1, 0 To CC_GFX_ROWS - 1) As Integer
Dim Shared CCPalette(0 To 7) As _Unsigned Long

Dim Shared CCWindow As Long
Dim Shared CCGlyphRows(32 To 126, 0 To 7) As Integer
Dim Shared CCResultText(1 To 40) As String
Dim Shared CCResultPassed(1 To 40) As Integer
Dim Shared CCResultCount As Integer
Dim Shared CCScenario As String
Dim Shared BASIC_InputActive As Integer
Dim Shared CCAscendDisplayColumn As Integer
Dim Shared CCAscendJoinPending As Integer
Dim Shared CCAscendOriginPointsSuppressed As Long
Dim Shared CCDecompressJoinAligned As Integer
Dim Shared CCRestJoinAligned As Integer

Dim Shared BASIC_WD As Single
Dim Shared BASIC_DR As Single
Dim Shared BASIC_AR As Single
Dim Shared BASIC_AD As Single
Dim Shared BASIC_CL As Single
Dim Shared BASIC_TK As Single
Dim Shared BASIC_IK As Single
Dim Shared BASIC_XS As Single
Dim Shared BASIC_YS As Single
Dim Shared BASIC_TimeMode As String
Dim Shared BASIC_AY As Single
Dim Shared BASIC_LA As Single

' [1370-1460] Scheduler and activity arrays retain their BASIC dimensions.
Dim Shared BASIC_PA(8, 5) As Single
Dim Shared BASIC_ES(30, 2) As Single
Dim Shared BASIC_AL(15, 7) As Single
Dim Shared BASIC_DT(21, 7) As Single
Dim Shared BASIC_C(7) As Integer
Dim Shared BASIC_PA_scalar As Integer
Dim Shared BASIC_ES_scalar As Integer
Dim Shared BASIC_EP As Integer
Dim Shared BASIC_AL_scalar As Integer
Dim Shared BASIC_P As Integer
Dim Shared BASIC_CK As Integer
Dim Shared BASIC_AA As Single
Dim Shared BASIC_BB As Single
Dim Shared BASIC_LM As Integer
Dim Shared BASIC_NA As Integer
Dim Shared BASIC_WE As Single
Dim Shared BASIC_HT As Single
Dim Shared BASIC_D5 As Single
Dim Shared BASIC_DX As Single
Dim Shared BASIC_E5 As Single
Dim Shared BASIC_EX As Single
Dim Shared BASIC_WM As Single
Dim Shared BASIC_NS As Single
Dim Shared BASIC_I6 As Integer
Dim Shared BASIC_L2 As Integer

' Stage 4 execution and diagnostic state. These do not alter BASIC time.
Dim Shared BASIC_DiveRunning As Integer
Dim Shared BASIC_DivePaused As Integer
Dim Shared BASIC_DescendComplete As Integer
Dim Shared BASIC_WorkActivated As Integer
Dim Shared BASIC_WorkStartedThisPass As Integer
Dim Shared BASIC_PromptAnswered As Integer
Dim Shared BASIC_BottomTime As Single
Dim Shared BASIC_BT As Single
Dim Shared BASIC_WorkTickCount As Long
Dim Shared BASIC_WorkDotCount As Long
Dim Shared BASIC_WorkGapCount As Long
Dim Shared BASIC_BandBarCount As Long
Dim Shared BASIC_WorkFragmentCount As Integer
Dim Shared BASIC_AscendTickCount As Long
Dim Shared BASIC_DecompressPassCount As Long
Dim Shared BASIC_DecompressCompleted As Integer
Dim Shared BASIC_DecompressCompletionCount As Integer
Dim Shared BASIC_RestPassCount As Long
Dim Shared BASIC_DiveEnded As Integer
Dim Shared BASIC_TickCount As Long
Dim Shared BASIC_VectorCount As Long
Dim Shared BASIC_LastLP As Integer
Dim Shared BASIC_LastLQ As Integer
Dim Shared BASIC_LastMP As Integer
Dim Shared BASIC_LastMQ As Integer
Dim Shared BASIC_NextWallTick As Double

Dim KeyValue As Long
Dim Finished As Integer

CCInitialise
DIVERInteractiveStartup

Do
    If BASIC_DiveRunning And Not BASIC_DivePaused Then
        If Timer(.001) >= BASIC_NextWallTick Then
            DIVERAdvanceSchedulerTick
            BASIC_NextWallTick = Timer(.001) + .4
        End If
    End If

    CCRender
    _Display

    KeyValue = _KeyHit
    Select Case KeyValue
        Case 114, 82 ' R
            DIVERInteractiveStartup
        Case 112, 80 ' P
            If BASIC_DiveRunning Then BASIC_DivePaused = Not BASIC_DivePaused
        Case 32 ' SPACE: execute exactly one source tick.
            If BASIC_DiveRunning Then
                DIVERAdvanceSchedulerTick
                BASIC_NextWallTick = Timer(.001) + .4
            End If
        Case 99, 67 ' C: host-only plain-text diagnostic copy.
            DIVERCopyDiagnostics
        Case 27
            Finished = -1
    End Select

    _Limit 30
Loop Until Finished

System

' [300-700] Dive-table values, retained in source row/column order.
DIVERDiveTableData:
Data 232,431,999,999,999,999,999
Data 137,140,159,179,201,229,270
Data 96,98,106,116,125,134,144
Data 72,73,81,88,94,99,105
Data 57,59,66,71,76,80,84
Data 46,49,55,60,63,67,70
Data 38,42,47,51,55,58,999
Data 32,37,41,45,48,51,999
Data 27,32,37,40,43,45,999
Data 23,29,33,36,39,41,999
Data 20,25,30,33,35,37,999
Data 18,23,27,30,32,34,999
Data 16,21,25,28,30,31,999
Data 14,20,23,26,27,29,999
Data 12,18,21,24,26,27,999
Data 11,17,20,22,24,25,999
Data 10,16,19,21,22,24,999
Data 9,15,18,20,21,999,999
Data 8,14,17,18,20,999,999
Data 8,13,16,17,999,999,999
Data 7,12,15,17,999,999,999


Sub CCInitialise
    CCWindow = _NewImage(CC_WINDOW_W, CC_WINDOW_H, 32)
    Screen CCWindow
    _Dest CCWindow
    _Font 8
    _Title "DIVER QB64 Stage 18 v03"

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
End Sub


Sub CCInitialiseGlyphs
    Dim GlyphData As String
    Dim CharacterCode As Integer
    Dim Row As Integer
    Dim Offset As Long

    ' ASCII 32..126, eight hexadecimal row bytes per character. Bedstead
    ' Regular is rasterised at the browser reconstruction's effective scale,
    ' then fitted to the terminal's eight-pixel character cell. This preserves
    ' the established glyph proportions rather than leaving a 5x7 image in
    ' the middle of an 8x8 cell.
    GlyphData = GlyphData + "00000000000000001818181818181800343434000000000034347E347E3434003C7E783C1A5A3C0070720C1830660600307878307A6E3A001818180000000000"
    GlyphData = GlyphData + "040C30303018040030180404040C3000185A3C183C7E18000018187E1818000000000000000018300000003C00000000000000000000180000020C1830200000"
    GlyphData = GlyphData + "183C6262626618001838181818183C003C66061C30607E007E02041C02423C00041C24647E0404007E607C0602023C001C30607C66623C007E020C1830303000"
    GlyphData = GlyphData + "3C66663E66623C003C66623E0206380000001800000018000000180000001830040C30603018040000007E007E00000030180606060C30003C660C0818001800"
    GlyphData = GlyphData + "3C667E7A7E603C00183C62627E6262007C66667E66627C003C66606060623C007C66626262627C007E60607C60607E007E60607C606060003C66606066623E00"
    GlyphData = GlyphData + "6262627E626262003C18181818183C000202020202023C0062667870786C62006060606060607E00627E7A7A626262006262727A6E6262003C66626262623C00"
    GlyphData = GlyphData + "7C66667C606060003C6662627A6E3A007C66667C786C62003C66603C02423C007E181818181818006262626262623C0062626634341C18006262627A7A7A3C00"
    GlyphData = GlyphData + "62623C183C66620062623C18181818007E020C1830607E003E30303030303E00006030180C0600007C04040404047C00183C6200000000000000000000007E00"
    GlyphData = GlyphData + "301804000000000000003C063E623E0060607C6662627C0000003E6060603E0002023E6262623E0000003C667E603C00040C183C1818180000003E6262623E02"
    GlyphData = GlyphData + "60607C66626262001800381818183C001800181818181818303032363C3832003818181818183C0000007C7E7A7A7A0000007C666262620000003C6662623C00"
    GlyphData = GlyphData + "00007C6662627C6000003E6262623E020000363C3030300000003E603C067C0018183C18181804000000626262623E000000626266341800000062627A7A3400"
    GlyphData = GlyphData + "000062361C1C62000000626262623E0200007E0C0C187E00060C18301818060018181818181818007018080C08187000307A040000000000"

    For CharacterCode = 32 To 126
        For Row = 0 To 7
            Offset = ((CharacterCode - 32) * 8 + Row) * 2 + 1
            CCGlyphRows(CharacterCode, Row) = Val("&H" + Mid$(GlyphData, Offset, 2))
        Next Row
    Next CharacterCode
End Sub


Sub CCReset
    Dim Column As Integer
    Dim Row As Integer
    Dim X As Integer
    Dim Y As Integer

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
    CCAscendDisplayColumn = -1
    CCAscendJoinPending = 0
    CCAscendOriginPointsSuppressed = 0
    CCDecompressJoinAligned = 0
    CCRestJoinAligned = 0

    For Row = 0 To CC_TEXT_ROWS - 1
        For Column = 0 To CC_TEXT_COLS - 1
            CCCellKind(Column, Row) = CC_CELL_TEXT
            CCTextCode(Column, Row) = 32
            CCTextForeground(Column, Row) = CCState.Foreground
            CCTextBackground(Column, Row) = CCState.Background
            CCTextBlink(Column, Row) = 0
            CCTextLarge(Column, Row) = 0
            CCTextInputScale(Column, Row) = 0
        Next Column
    Next Row

    For Y = 0 To CC_GFX_ROWS - 1
        For X = 0 To CC_GFX_COLS - 1
            CCGraphicsColour(X, Y) = -1
            CCAscendCell(X, Y) = 0
        Next X
    Next Y
End Sub


Sub CCPlotBegin
    ' Marks a BASIC PLOT-statement boundary. The real terminal receives a
    ' continuous byte stream, but DIVER also sends ordinary terminal controls
    ' at statement boundaries while Graphic Plot Mode remains active.
    '
    ' Plot submode state and partially supplied arguments are not reset.
End Sub


Sub CCSend (Value As Integer)
    Dim IsPlotSubmode As Integer

    Value = Value And 255

    If CCState.Pending <> CC_PENDING_NONE Then
        CCHandlePending Value
        Exit Sub
    End If

    ' Codes 29 and 30 leave a colour field selected. The following colour
    ' value is data even though values 16..23 are below printable ASCII.
    If CCState.ColourTarget <> 0 Then
        If Value >= 16 And Value <= 23 Then
            If CCState.ColourTarget = 1 Then
                CCState.Foreground = Value And 7
            Else
                CCState.Background = Value And 7
            End If
            CCState.ColourTarget = 0
            Exit Sub
        End If

        ' [6590] ends with a lone PLOT 29. The following [6591] statement
        ' begins PLOT 2,253,X3,Y3,255; its point-mode byte cancels the
        ' incomplete colour selection. Without this cancellation, X3 values
        ' 16..23 are later consumed as colours instead of coordinates.
        CCState.ColourTarget = 0
    End If

    If CCState.Mode = CC_PLOT_MODE Then
        If Value = 255 Then
            CCState.Mode = CC_TEXT_MODE
            CCState.PlotSubmode = 253
            CCState.PlotForceData = 0
            Exit Sub
        End If

        IsPlotSubmode = (Value >= 240 And Value <= 254)
        If IsPlotSubmode Then
            CCState.PlotSubmode = Value
            CCState.PlotForceData = -1
            Exit Sub
        End If

        ' Once a plot submode has requested a coordinate, all values in the
        ' documented coordinate range are data, including control-code values.
        If CCState.PlotForceData Then
            CCHandlePlotData Value
            Exit Sub
        End If

        ' These controls are used by DIVER while Plot Mode remains active.
        Select Case Value
            Case 2, 3, 6, 8, 12, 14, 15, 27, 29, 30, 31
                CCHandleControl Value
            Case Else
                CCHandlePlotData Value
        End Select
        Exit Sub
    End If

    Select Case Value
        Case 2, 3, 6, 8, 12, 14, 15, 27, 29, 30, 31
            CCHandleControl Value
        Case 7
            Beep
        Case 32 To 126
            CCWriteCharacter Value
        Case Else
            ' Other terminal bytes are outside the present DIVER subset.
    End Select
End Sub


Sub CCHandleControl (Value As Integer)
    Select Case Value
        Case 2
            CCState.Mode = CC_PLOT_MODE
            CCState.PlotSubmode = 253
            CCState.PlotForceData = -1

        Case 3
            CCState.Pending = CC_PENDING_CURSOR_X

        Case 6
            CCState.Pending = CC_PENDING_CCI

        Case 8
            CCState.TextColumn = 0
            CCState.TextRow = 0

        Case 12
            CCClearPage

        Case 14
            CCState.LargeCharacters = -1

        Case 15
            CCState.LargeCharacters = 0
            CCState.Flag = 0

        Case 27
            CCState.Pending = CC_PENDING_ESCAPE

        Case 29
            ' The next colour-value byte (16..23) selects foreground.
            CCState.ColourTarget = 1

        Case 30
            ' The next colour-value byte (16..23) selects background.
            CCState.ColourTarget = 2

        Case 31
            CCState.Flag = -1
    End Select
End Sub


Sub CCHandlePending (Value As Integer)
    Select Case CCState.Pending
        Case CC_PENDING_CCI
            CCApplyCCI Value
            CCState.Pending = CC_PENDING_NONE

        Case CC_PENDING_CURSOR_X
            CCState.PendingX = Value
            CCState.Pending = CC_PENDING_CURSOR_Y

        Case CC_PENDING_CURSOR_Y
            CCState.TextColumn = CCState.PendingX
            CCState.TextRow = Value
            CCState.Pending = CC_PENDING_NONE

        Case CC_PENDING_ESCAPE
            Select Case Value
                Case 10
                    CCState.WriteDirection = CC_WRITE_VERTICAL
                Case 11
                    CCState.WriteDirection = CC_WRITE_HORIZONTAL
            End Select
            CCState.Pending = CC_PENDING_NONE
    End Select
End Sub


Sub CCApplyCCI (Value As Integer)
    ' CCI status bytes hold foreground in bits 0..2, background in bits 3..5
    ' and the Flag/blink bit in bit 6. Code 14 controls double-height output.
    CCState.Foreground = Value And 7
    CCState.Background = (Value \ 8) And 7
    CCState.Flag = ((Value And 64) <> 0)
    CCState.ColourTarget = 0
End Sub


Sub CCHandlePlotData (Value As Integer)
    ' Submode transitions follow the terminal manual. Codes 253/252 define
    ' an X,Y point. 250/249/248 draw repeated horizontal bars. 246/245/244
    ' draw repeated vertical bars. 242/241 draw vectors from the point last
    ' established by Point Plot to each new vector endpoint.
    Select Case CCState.PlotSubmode
        Case 253 ' X Point Plot
            CCState.PointX = CCWrapX%(Value)
            CCState.PlotSubmode = 252
            CCState.PlotForceData = -1

        Case 252 ' Y Point Plot
            CCState.PointY = CCWrapY%(Value)
            If CCAscendDisplayColumn >= 0 Then
                ' [6320] still establishes the literal (LP,MP) vector origin.
                ' The complete-column ASCEND adapter consumes that origin in
                ' CCDrawVector; painting it here as well leaves a false block
                ' one column to the left of the accepted ASCEND stroke.
                CCAscendOriginPointsSuppressed = CCAscendOriginPointsSuppressed + 1
            Else
                CCSetGraphicsBlock CCState.PointX, CCState.PointY
            End If
            CCState.PlotSubmode = 253
            CCState.PlotForceData = 0

        Case 250 ' X Bar Graph, X0
            CCState.BarOrigin = CCWrapX%(Value)
            CCState.PlotSubmode = 249
            CCState.PlotForceData = -1

        Case 249 ' X Bar Graph, Y
            CCState.BarOther = CCWrapY%(Value)
            CCState.PlotSubmode = 248
            CCState.PlotForceData = -1

        Case 248 ' X Bar Graph, X Max
            CCDrawHorizontalBar CCState.BarOrigin, CCWrapX%(Value), CCState.BarOther
            CCState.PlotSubmode = 249
            CCState.PlotForceData = -1

        Case 246 ' Y Bar Graph, Y0
            CCState.BarOrigin = CCWrapY%(Value)
            CCState.PlotSubmode = 245
            CCState.PlotForceData = -1

        Case 245 ' Y Bar Graph, X
            CCState.BarOther = CCWrapX%(Value)
            CCState.PlotSubmode = 244
            CCState.PlotForceData = -1

        Case 244 ' Y Bar Graph, Y Max
            CCDrawVerticalBar CCState.BarOther, CCState.BarOrigin, CCWrapY%(Value)
            CCState.PlotSubmode = 245
            CCState.PlotForceData = -1

        Case 242 ' Vector Mode, X0
            CCState.BarOrigin = CCWrapX%(Value)
            CCState.PlotSubmode = 241
            CCState.PlotForceData = -1

        Case 241 ' Vector Mode, Y0
            CCDrawVector CCState.PointX, CCState.PointY, CCState.BarOrigin, CCWrapY%(Value)
            CCState.PointX = CCState.BarOrigin
            CCState.PointY = CCWrapY%(Value)
            CCState.PlotSubmode = 242
            CCState.PlotForceData = -1

        Case Else
            CCState.UnsupportedPlotBytes = CCState.UnsupportedPlotBytes + 1
            CCState.PlotForceData = 0
    End Select
End Sub


Function CCWrapX% (Value As Integer)
    Dim Result As Integer

    Result = Value Mod CC_GFX_COLS
    If Result < 0 Then Result = Result + CC_GFX_COLS
    CCWrapX% = Result
End Function


Function CCWrapY% (Value As Integer)
    Dim Result As Integer

    Result = Value Mod CC_GFX_ROWS
    If Result < 0 Then Result = Result + CC_GFX_ROWS
    CCWrapY% = Result
End Function


Sub CCWriteText (TextValue As String)
    Dim Index As Integer

    If CCState.Mode = CC_PLOT_MODE Then
        ' Verified DIVER behaviour: ordinary PRINT text is not displayed while
        ' Graphic Plot Mode remains active. This reconstruction records those bytes rather than
        ' inventing unverified raster marks for printable characters.
        CCState.SuppressedTextBytes = CCState.SuppressedTextBytes + Len(TextValue)
        Exit Sub
    End If

    For Index = 1 To Len(TextValue)
        CCWriteCharacter Asc(Mid$(TextValue, Index, 1))
    Next Index
End Sub


Sub CCWriteCharacter (CharacterCode As Integer)
    Dim Column As Integer
    Dim Row As Integer

    ' Codes 16..23 following 29 or 30 select one of the eight colours.
    If CCState.ColourTarget <> 0 And CharacterCode >= 16 And CharacterCode <= 23 Then
        If CCState.ColourTarget = 1 Then
            CCState.Foreground = CharacterCode And 7
        Else
            CCState.Background = CharacterCode And 7
        End If
        CCState.ColourTarget = 0
        Exit Sub
    End If

    Column = CCState.TextColumn
    Row = CCState.TextRow

    ' Column 80 is deliberately used by DIVER to move the cursor off-screen.
    If Column >= 0 And Column < CC_TEXT_COLS And Row >= 0 And Row < CC_TEXT_ROWS Then
        CCClearTextCell Column, Row
        CCCellKind(Column, Row) = CC_CELL_TEXT
        CCTextCode(Column, Row) = CharacterCode
        CCTextForeground(Column, Row) = CCState.Foreground
        CCTextBackground(Column, Row) = CCState.Background
        CCTextBlink(Column, Row) = CCState.Flag
        CCTextLarge(Column, Row) = CCState.LargeCharacters
        CCTextInputScale(Column, Row) = BASIC_InputActive

        If CCState.LargeCharacters And Row < CC_TEXT_ROWS - 1 Then
            CCClearTextCell Column, Row + 1
            CCCellKind(Column, Row + 1) = CC_CELL_LARGE_CONTINUATION
            CCTextBackground(Column, Row + 1) = CCState.Background
            CCTextInputScale(Column, Row + 1) = 0
        End If
    End If

    If CCState.WriteDirection = CC_WRITE_VERTICAL Then
        ' CCEMU confirms that vertical writing advances by the full character
        ' height: one row normally and two rows while LARGE is active.
        If CCState.LargeCharacters Then
            CCState.TextRow = CCState.TextRow + 2
        Else
            CCState.TextRow = CCState.TextRow + 1
        End If
    Else
        CCState.TextColumn = CCState.TextColumn + 1
    End If
End Sub


Sub CCNewLine
    If CCState.LargeCharacters Then
        CCState.TextRow = CCState.TextRow + 2
    Else
        CCState.TextRow = CCState.TextRow + 1
    End If
    CCState.TextColumn = 0
End Sub


Sub CCClearPage
    Dim Column As Integer
    Dim Row As Integer
    Dim X As Integer
    Dim Y As Integer

    For Row = 0 To CC_TEXT_ROWS - 1
        For Column = 0 To CC_TEXT_COLS - 1
            CCCellKind(Column, Row) = CC_CELL_TEXT
            CCTextCode(Column, Row) = 32
            CCTextForeground(Column, Row) = CCState.Foreground
            CCTextBackground(Column, Row) = CCState.Background
            CCTextBlink(Column, Row) = 0
            CCTextLarge(Column, Row) = 0
            CCTextInputScale(Column, Row) = 0
        Next Column
    Next Row

    For Y = 0 To CC_GFX_ROWS - 1
        For X = 0 To CC_GFX_COLS - 1
            CCGraphicsColour(X, Y) = -1
        Next X
    Next Y

    CCState.TextColumn = 0
    CCState.TextRow = 0
End Sub


Sub CCClearTextCell (Column As Integer, Row As Integer)
    Dim X As Integer
    Dim Y As Integer
    Dim FirstGraphicsY As Integer

    If Column < 0 Or Column >= CC_TEXT_COLS Then Exit Sub
    If Row < 0 Or Row >= CC_TEXT_ROWS Then Exit Sub
    CCTextInputScale(Column, Row) = 0

    FirstGraphicsY = CC_GFX_ROWS - 1 - Row * 4
    For Y = FirstGraphicsY - 3 To FirstGraphicsY
        For X = Column * 2 To Column * 2 + 1
            If X >= 0 And X < CC_GFX_COLS And Y >= 0 And Y < CC_GFX_ROWS Then
                CCGraphicsColour(X, Y) = -1
            End If
        Next X
    Next Y
End Sub


Sub CCSetGraphicsBlock (X As Integer, Y As Integer)
    Dim Column As Integer
    Dim Row As Integer

    X = CCWrapX%(X)
    Y = CCWrapY%(Y)

    Column = X \ 2
    Row = CC_TEXT_ROWS - 1 - (Y \ 4)

    If CCState.Flag Then
        If CCGraphicsColour(X, Y) >= 0 Then
            CCGraphicsColour(X, Y) = -1
        Else
            CCGraphicsColour(X, Y) = CCState.Foreground
        End If
    Else
        CCGraphicsColour(X, Y) = CCState.Foreground
    End If

    If Column >= 0 And Column < CC_TEXT_COLS And Row >= 0 And Row < CC_TEXT_ROWS Then
        CCCellKind(Column, Row) = CC_CELL_GRAPHICS
        CCTextCode(Column, Row) = 32
        CCTextBackground(Column, Row) = CCState.Background
    End If
End Sub


Sub CCDrawHorizontalBar (X0 As Integer, X1 As Integer, Y As Integer)
    Dim X As Integer
    Dim StepValue As Integer

    If X1 >= X0 Then StepValue = 1 Else StepValue = -1
    X = X0
    Do
        CCSetGraphicsBlock X, Y
        If X = X1 Then Exit Do
        X = X + StepValue
    Loop
End Sub


Sub CCDrawVerticalBar (X As Integer, Y0 As Integer, Y1 As Integer)
    Dim Y As Integer
    Dim StepValue As Integer

    If Y1 >= Y0 Then StepValue = 1 Else StepValue = -1
    Y = Y0
    Do
        CCSetGraphicsBlock X, Y
        If Y = Y1 Then Exit Do
        Y = Y + StepValue
    Loop
End Sub


Sub CCDrawVector (X1 As Integer, Y1 As Integer, X0 As Integer, Y0 As Integer)
    Dim X As Integer
    Dim Y As Integer
    Dim DeltaX As Integer
    Dim DeltaY As Integer
    Dim StepX As Integer
    Dim StepY As Integer
    Dim ErrorValue As Integer
    Dim TwiceError As Integer

    ' Visible-result adapter for the source [6320] ASCEND vector. The accepted
    ' browser reconstruction groups each source-derived vertical interval in
    ' one complete display column. A generic Bresenham diagonal divides the
    ' interval between adjacent columns and allows the final WORK-band stair
    ' to absorb its lower half. This changes raster grouping only: the source
    ' endpoints have already passed through the terminal parser unchanged.
    If CCAscendDisplayColumn >= 0 Then
        If Y0 = Y1 Then
            CCSetGraphicsBlock CCAscendDisplayColumn, Y0
            CCAscendCell(CCAscendDisplayColumn, Y0) = 1
            If CCAscendJoinPending Then CCAscendCell(CCAscendDisplayColumn, Y0) = 2
        Else
            If Y0 > Y1 Then StepY = 1 Else StepY = -1
            Y = Y1
            Do While Y <> Y0
                CCSetGraphicsBlock CCAscendDisplayColumn, Y
                CCAscendCell(CCAscendDisplayColumn, Y) = 1
                If CCAscendJoinPending And Y = Y1 Then CCAscendCell(CCAscendDisplayColumn, Y) = 2
                Y = Y + StepY
            Loop
        End If
        CCAscendDisplayColumn = -1
        CCAscendJoinPending = 0
        Exit Sub
    End If

    ' Integer best-fit raster line. The tie behaviour is deliberately isolated
    ' here because it is the part to compare with CCEMU vector diagnostics.
    X = X1
    Y = Y1
    DeltaX = Abs(X0 - X1)
    DeltaY = -Abs(Y0 - Y1)
    If X1 < X0 Then StepX = 1 Else StepX = -1
    If Y1 < Y0 Then StepY = 1 Else StepY = -1
    ErrorValue = DeltaX + DeltaY

    Do
        CCSetGraphicsBlock X, Y
        If X = X0 And Y = Y0 Then Exit Do

        TwiceError = 2 * ErrorValue
        If TwiceError >= DeltaY Then
            ErrorValue = ErrorValue + DeltaY
            X = X + StepX
        End If
        If TwiceError <= DeltaX Then
            ErrorValue = ErrorValue + DeltaX
            Y = Y + StepY
        End If
    Loop
End Sub


Sub CCRender
    Dim Column As Integer
    Dim Row As Integer
    Dim X As Integer
    Dim Y As Integer
    Dim ScreenX As Integer
    Dim ScreenY As Integer
    Dim BackgroundIndex As Integer

    _Dest CCWindow
    Cls , _RGB32(24, 24, 24)

    ' Character-cell backgrounds.
    For Row = 0 To CC_TEXT_ROWS - 1
        For Column = 0 To CC_TEXT_COLS - 1
            BackgroundIndex = CCTextBackground(Column, Row)
            ScreenX = Column * 2 * CC_BLOCK_W
            ScreenY = Row * 4 * CC_BLOCK_H
            Line (ScreenX, ScreenY)-(ScreenX + 2 * CC_BLOCK_W - 1, ScreenY + 4 * CC_BLOCK_H - 1), CCPalette(BackgroundIndex), BF
        Next Column
    Next Row

    ' Plot blocks use a lower-left origin; the QB64 surface uses upper-left.
    For Y = 0 To CC_GFX_ROWS - 1
        For X = 0 To CC_GFX_COLS - 1
            If CCGraphicsColour(X, Y) >= 0 Then
                ScreenX = X * CC_BLOCK_W
                ScreenY = (CC_GFX_ROWS - 1 - Y) * CC_BLOCK_H
                If CCAscendCell(X, Y) = 1 Then
                    ' Host-pixel compensation for the full-cell diagonal
                    ' corner contact. Logical plot colour remains unchanged.
                    Line (ScreenX, ScreenY)-(ScreenX + CC_BLOCK_W - 1, ScreenY + CC_BLOCK_H - 1), CCPalette(4), BF
                    Line (ScreenX + 1, ScreenY)-(ScreenX + CC_BLOCK_W - 1, ScreenY + CC_BLOCK_H - 1), CCPalette(CCGraphicsColour(X, Y)), BF
                Else
                    Line (ScreenX, ScreenY)-(ScreenX + CC_BLOCK_W - 1, ScreenY + CC_BLOCK_H - 1), CCPalette(CCGraphicsColour(X, Y)), BF
                End If
            End If
        Next X
    Next Y

    For Row = 0 To CC_TEXT_ROWS - 1
        For Column = 0 To CC_TEXT_COLS - 1
            If CCCellKind(Column, Row) = CC_CELL_TEXT And CCTextCode(Column, Row) <> 32 Then
                CCRenderCharacter Column, Row
            End If
        Next Column
    Next Row

    CCRenderPanel
End Sub


Sub CCRenderCharacter (Column As Integer, Row As Integer)
    Dim ScreenX As Integer
    Dim ScreenY As Integer
    Dim ShowCharacter As Integer
    Dim CharacterCode As Integer
    Dim GlyphRow As Integer
    Dim GlyphColumn As Integer
    Dim RowBits As Integer
    Dim TargetHeight As Integer
    Dim DrawY0 As Integer
    Dim DrawY1 As Integer

    ShowCharacter = -1
    If CCTextBlink(Column, Row) Then
        If (Int(Timer(.001) * 2) Mod 2) = 0 Then
            ShowCharacter = -1
        Else
            ShowCharacter = 0
        End If
    End If
    If Not ShowCharacter Then Exit Sub

    ScreenX = Column * 2 * CC_BLOCK_W
    ScreenY = Row * 4 * CC_BLOCK_H

    CharacterCode = CCTextCode(Column, Row)
    If CharacterCode < 32 Or CharacterCode > 126 Then CharacterCode = 63
    If CCTextInputScale(Column, Row) Then
        TargetHeight = 13
    ElseIf CCTextLarge(Column, Row) Then
        TargetHeight = 16
    Else
        TargetHeight = 8
    End If

    ' Draw the embedded Bedstead bitmap directly into the terminal cell.
    ' LARGE doubles the terminal character height. Input text uses the
    ' browser reconstruction's equivalent 13-pixel presentation height while
    ' retaining the source's ordinary, non-LARGE character state.
    For GlyphRow = 0 To 7
        RowBits = CCGlyphRows(CharacterCode, GlyphRow)
        DrawY0 = (GlyphRow * TargetHeight) \ 8
        DrawY1 = ((GlyphRow + 1) * TargetHeight) \ 8 - 1
        For GlyphColumn = 0 To 7
            If (RowBits And (2 ^ (7 - GlyphColumn))) <> 0 Then
                Line (ScreenX + GlyphColumn, ScreenY + DrawY0)-(ScreenX + GlyphColumn, ScreenY + DrawY1), CCPalette(CCTextForeground(Column, Row)), BF
            End If
        Next GlyphColumn
    Next GlyphRow
End Sub


Sub CCRenderPanel
    Dim PanelX As Integer
    Dim PanelY As Integer
    Dim StateText As String
    Dim WorkMask As String
    Dim WorkX As Integer
    Dim EdgeMask As String
    Dim EdgeY As Integer

    PanelX = CC_DISPLAY_W + 16
    PanelY = 14

    Color _RGB32(240, 240, 240), _RGB32(24, 24, 24)
    _Font 8
    _PrintString (PanelX, PanelY), "DIVER QB64 STAGE 18 V03"
    PanelY = PanelY + 20
    _PrintString (PanelX, PanelY), CCScenario

    PanelY = PanelY + 28
    _PrintString (PanelX, PanelY), "Type answers on the DIVER screen"
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "R restart and re-enter WD/mode"
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "P pause/resume; SPACE single tick"
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "C copy diagnostics; ESC close"

    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "Font: embedded Bedstead bitmap"

    PanelY = PanelY + 28
    _PrintString (PanelX, PanelY), "SOURCE through [8100]; dive completion"
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "WD:" + Str$(BASIC_WD) + "  mode: " + DIVERModeLabel$
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "TK:" + Str$(BASIC_TK) + "  IK:" + Str$(BASIC_IK)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "XS:" + Str$(BASIC_XS) + "  YS:" + Str$(BASIC_YS)

    PanelY = PanelY + 20
    _PrintString (PanelX, PanelY), "Tick:" + Str$(BASIC_TickCount) + " vectors:" + Str$(BASIC_VectorCount) + " ascend:" + Str$(BASIC_AscendTickCount) + " decomp:" + Str$(BASIC_DecompressPassCount) + " rest:" + Str$(BASIC_RestPassCount)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "CL:" + Str$(BASIC_CL) + "  AD:" + Str$(BASIC_AD)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "LP,LQ:" + Str$(BASIC_LastLP) + "," + Str$(BASIC_LastLQ)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "MP,MQ:" + Str$(BASIC_LastMP) + "," + Str$(BASIC_LastMQ)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "NA:" + Str$(BASIC_NA) + "  PA:" + Str$(BASIC_PA_scalar) + "  AL:" + Str$(BASIC_AL_scalar)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "Input BT:" + Str$(BASIC_BottomTime) + "  source BT:" + Str$(BASIC_BT)
    PanelY = PanelY + 14
    If BASIC_AL_scalar > 0 Then
        If BASIC_AL(BASIC_AL_scalar, 1) = 2 Then
            _PrintString (PanelX, PanelY), "Type:2 rate:" + LTrim$(Str$(BASIC_AL(BASIC_AL_scalar, 2))) + " target:" + LTrim$(Str$(BASIC_AL(BASIC_AL_scalar, 4))) + " end:" + LTrim$(Str$(BASIC_AL(BASIC_AL_scalar, 7)))
        Else
            _PrintString (PanelX, PanelY), "Current type:" + Str$(BASIC_AL(BASIC_AL_scalar, 1)) + "  duration:" + Str$(BASIC_AL(BASIC_AL_scalar, 2))
        End If
    End If
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "WORK ticks:" + Str$(BASIC_WorkTickCount) + "  dots:" + Str$(BASIC_WorkDotCount) + " gaps:" + Str$(BASIC_WorkGapCount) + " bands:" + Str$(BASIC_BandBarCount)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "Fragments:" + Str$(BASIC_WorkFragmentCount) + "  WE:" + Str$(BASIC_WE) + " HT:" + Str$(BASIC_HT) + " D5:" + Str$(BASIC_D5) + " DX:" + Str$(BASIC_DX)

    PanelY = PanelY + 28
    If CCState.Mode = CC_PLOT_MODE Then
        StateText = "Mode: PLOT  submode:" + Str$(CCState.PlotSubmode)
    Else
        StateText = "Mode: TEXT"
    End If
    _PrintString (PanelX, PanelY), StateText
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "FG/BG:" + Str$(CCState.Foreground) + "/" + Str$(CCState.Background)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "Large:" + Str$(CCState.LargeCharacters <> 0) + "  Flag:" + Str$(CCState.Flag <> 0)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "Suppressed text bytes:" + Str$(CCState.SuppressedTextBytes)
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "Graphics blocks:" + Str$(CCCountGraphicsBlocks&)

    PanelY = PanelY + 14
    For WorkX = 50 To 53
        If CCGraphicsColour(WorkX, 60) = 0 Then
            WorkMask = WorkMask + "#"
        Else
            WorkMask = WorkMask + "."
        End If
    Next WorkX
    _PrintString (PanelX, PanelY), "WORK row 50-53: " + WorkMask

    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "DM: " + CCTextSlice$(69, 4, 6) + " |" + CCTextSlice$(69, 7, 6) + "|" + CCTextSlice$(69, 9, 6) + "| D=" + CCTextSlice$(76, 4, 2)

    For EdgeY = 61 To 63
        If CCGraphicsColour(32, EdgeY) = 4 Then
            EdgeMask = EdgeMask + "B"
        Else
            EdgeMask = EdgeMask + "."
        End If
    Next EdgeY
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "Blue edge x32/y61-63: " + EdgeMask

    PanelY = PanelY + 20
    Color _RGB32(90, 240, 130), _RGB32(24, 24, 24)
    If BASIC_AL_scalar >= 11 And BASIC_AL(BASIC_AL_scalar, 1) = 5 Then
        _PrintString (PanelX, PanelY), "REST activated at surface"
    ElseIf BASIC_DecompressCompletionCount >= 2 Then
        _PrintString (PanelX, PanelY), "Final ASCEND active"
    ElseIf BASIC_AL_scalar >= 9 And BASIC_AL(BASIC_AL_scalar, 1) = 4 Then
        _PrintString (PanelX, PanelY), "5m DECOMPRESS active"
    ElseIf BASIC_DecompressCompleted Then
        _PrintString (PanelX, PanelY), "ASCEND after DECOMPRESS active"
    ElseIf BASIC_DecompressPassCount >= 1 Then
        _PrintString (PanelX, PanelY), "DECOMPRESS pass" + Str$(BASIC_DecompressPassCount)
    ElseIf BASIC_AL_scalar > 0 And BASIC_AL(BASIC_AL_scalar, 1) = 4 Then
        _PrintString (PanelX, PanelY), "DECOMPRESS activated at CL=23.75"
    ElseIf BASIC_AscendTickCount >= 1 Then
        _PrintString (PanelX, PanelY), "First ASCEND pass complete at CL=21.75"
    ElseIf BASIC_AL_scalar > 0 And BASIC_AL(BASIC_AL_scalar, 1) = 2 Then
        _PrintString (PanelX, PanelY), "ASCEND activated at CL=21.75"
    ElseIf BASIC_WorkFragmentCount >= 4 Then
        _PrintString (PanelX, PanelY), "Final WORK fragment active"
    ElseIf BASIC_BandBarCount > 0 Then
        _PrintString (PanelX, PanelY), "Current WORK fragment continues"
    ElseIf BASIC_WorkActivated Then
        _PrintString (PanelX, PanelY), "WORK active; awaiting first band"
    ElseIf BASIC_DescendComplete Then
        _PrintString (PanelX, PanelY), "DESCEND at physical working depth"
    ElseIf BASIC_DivePaused Then
        _PrintString (PanelX, PanelY), "DESCEND paused"
    Else
        _PrintString (PanelX, PanelY), "Live predictive scheduler slice"
    End If
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "[2140]/[5700-5890] REST NEXT translated"
    PanelY = PanelY + 14
    _PrintString (PanelX, PanelY), "Stops after REST [1789]; before [1790]"
End Sub


Sub DIVERCopyDiagnostics
    Dim Report As String
    Dim NL As String
    Dim ModeText As String
    Dim WorkMask As String
    Dim WorkX As Integer
    Dim EdgeMask As String
    Dim EdgeY As Integer
    Dim AscendMask As String
    Dim AscendY As Integer

    NL = Chr$(13) + Chr$(10)
    If CCState.Mode = CC_PLOT_MODE Then
        ModeText = "PLOT submode" + Str$(CCState.PlotSubmode)
    Else
        ModeText = "TEXT"
    End If

    For WorkX = 50 To 53
        If CCGraphicsColour(WorkX, 60) = 0 Then
            WorkMask = WorkMask + "#"
        Else
            WorkMask = WorkMask + "."
        End If
    Next WorkX
    For EdgeY = 61 To 63
        If CCGraphicsColour(32, EdgeY) = 4 Then
            EdgeMask = EdgeMask + "B"
        Else
            EdgeMask = EdgeMask + "."
        End If
    Next EdgeY
    For AscendY = 60 To 74
        If CCGraphicsColour(54, AscendY) = 0 Then
            AscendMask = AscendMask + "#"
        Else
            AscendMask = AscendMask + "."
        End If
    Next AscendY

    Report = "DIVER QB64 STAGE 18 V03" + NL
    Report = Report + "Status: " + CCScenario + NL
    Report = Report + "WD:" + Str$(BASIC_WD) + " mode:" + DIVERModeLabel$ + " TK:" + Str$(BASIC_TK) + " IK:" + Str$(BASIC_IK) + " XS:" + Str$(BASIC_XS) + " YS:" + Str$(BASIC_YS) + NL
    Report = Report + "Tick:" + Str$(BASIC_TickCount) + " vectors:" + Str$(BASIC_VectorCount) + " ascend passes:" + Str$(BASIC_AscendTickCount) + " decompress passes:" + Str$(BASIC_DecompressPassCount) + " REST passes:" + Str$(BASIC_RestPassCount) + NL
    Report = Report + "CL:" + Str$(BASIC_CL) + " AD:" + Str$(BASIC_AD) + " LP,LQ:" + Str$(BASIC_LastLP) + "," + Str$(BASIC_LastLQ) + " MP,MQ:" + Str$(BASIC_LastMP) + "," + Str$(BASIC_LastMQ) + NL
    Report = Report + "NA:" + Str$(BASIC_NA) + " PA:" + Str$(BASIC_PA_scalar) + " AL:" + Str$(BASIC_AL_scalar) + NL
    If BASIC_AL_scalar > 0 Then
        Report = Report + "Activity type:" + Str$(BASIC_AL(BASIC_AL_scalar, 1)) + " field2:" + Str$(BASIC_AL(BASIC_AL_scalar, 2)) + " from:" + Str$(BASIC_AL(BASIC_AL_scalar, 3)) + " target:" + Str$(BASIC_AL(BASIC_AL_scalar, 4)) + " default:" + Str$(BASIC_AL(BASIC_AL_scalar, 5)) + " start:" + Str$(BASIC_AL(BASIC_AL_scalar, 6)) + " end:" + Str$(BASIC_AL(BASIC_AL_scalar, 7)) + NL
    End If
    Report = Report + "Input BT:" + Str$(BASIC_BottomTime) + " source BT:" + Str$(BASIC_BT) + NL
    Report = Report + "WORK ticks:" + Str$(BASIC_WorkTickCount) + " dots:" + Str$(BASIC_WorkDotCount) + " gaps:" + Str$(BASIC_WorkGapCount) + " bands:" + Str$(BASIC_BandBarCount) + " fragments:" + Str$(BASIC_WorkFragmentCount) + NL
    Report = Report + "WE:" + Str$(BASIC_WE) + " HT:" + Str$(BASIC_HT) + " D5:" + Str$(BASIC_D5) + " DX:" + Str$(BASIC_DX) + NL
    Report = Report + "Mode:" + ModeText + " FG/BG:" + Str$(CCState.Foreground) + "/" + Str$(CCState.Background) + " large:" + Str$(CCState.LargeCharacters <> 0) + " flag:" + Str$(CCState.Flag <> 0) + NL
    Report = Report + "Suppressed text bytes:" + Str$(CCState.SuppressedTextBytes) + " graphics blocks:" + Str$(CCCountGraphicsBlocks&) + NL
    Report = Report + "WORK row 50-53: " + WorkMask + NL
    Report = Report + "DM: " + CCTextSlice$(69, 4, 6) + " |" + CCTextSlice$(69, 7, 6) + "|" + CCTextSlice$(69, 9, 6) + "| D=" + CCTextSlice$(76, 4, 2) + NL
    Report = Report + "Blue edge x32/y61-63: " + EdgeMask + NL
    Report = Report + "ASCEND x54/y60-74: " + AscendMask + NL
    Report = Report + "ASCEND origin points suppressed:" + Str$(CCAscendOriginPointsSuppressed) + NL
    Report = Report + "ASCEND raster: clean complete strokes + blue separation" + NL
    Report = Report + "DECOMPRESS raster: literal zero-length [6320] vector" + NL
    If CCDecompressJoinAligned Then Report = Report + "DECOMPRESS join: blue-left-edge continuity applied" + NL
    If CCRestJoinAligned Then Report = Report + "REST join: literal activation point + blue-left-edge continuity" + NL
    Report = Report + "GOSUB 7500 completions:" + Str$(BASIC_DecompressCompletionCount) + " HT:" + Str$(BASIC_HT) + NL
    Report = Report + "WM:" + Str$(BASIC_WM) + " NS:" + Str$(BASIC_NS) + NL
    If BASIC_DiveEnded Then Report = Report + "GOSUB 8000: MEMORY display complete; [1820] END" + NL

    _Clipboard$ = Report
    Beep
End Sub


Function DIVERModeLabel$
    ' Diagnostic label only. The source selects ACCELERATED for every answer
    ' other than REAL, including a blank answer; do not rewrite the input.
    If BASIC_TimeMode = "REAL" Then
        DIVERModeLabel$ = "REAL"
    Else
        DIVERModeLabel$ = "ACCELERATED"
    End If
End Function


Sub CCAddResult (Description As String, Passed As Integer)
    If CCResultCount >= UBound(CCResultText) Then Exit Sub
    CCResultCount = CCResultCount + 1
    CCResultText(CCResultCount) = Description
    CCResultPassed(CCResultCount) = Passed
End Sub


Sub CCRunTests
    Dim CountValue As Long

    CCResultCount = 0

    ' P01: [1010] complete ordered control chain.
    CCReset
    CCSend1010
    CCAddResult "[1010] page erased blue", CCTextBackground(0, 0) = 4
    CCAddResult "[1010] later BG is cyan", CCState.Background = 6
    CCAddResult "[1010] LARGE is active", CCState.LargeCharacters <> 0

    ' P04: [1261]-[1266] title does not become ordinary text in Plot Mode.
    CCReset
    CCPlotBegin
    CCSendPlot3 2, 14, 15
    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."
    CCAddResult "title hidden in Plot Mode", CCTextAt%(29, 43, Asc("D")) = 0
    CCAddResult "hidden bytes recorded", CCState.SuppressedTextBytes = 23

    ' P05: diagnostic PLOT 255 restores ordinary text output.
    CCPlotBegin
    CCSend 255
    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."
    CCAddResult "PLOT 255 reveals title", CCTextAt%(29, 43, Asc("D"))

    ' P06: [1273]-[1277] bar state survives separate PLOT statements.
    CCReset
    CCPlotBegin
    CCSendPlot3 2, 250, 0
    CCPlotBegin
    CCSendPlot2 140, 1
    CCPlotBegin
    CCSend 255
    CCAddResult "X-bar spans x=0..1", CCGraphicsColour(0, 140) >= 0 And CCGraphicsColour(1, 140) >= 0

    ' P08: [6320] point followed by Vector Mode.
    CCReset
    CCApplyCCI 32
    CCPlotBegin
    CCSendPlot7 2, 253, 10, 140, 242, 13, 60
    CountValue = CCCountGraphicsBlocks&
    CCAddResult "vector includes both ends", CCGraphicsColour(10, 140) >= 0 And CCGraphicsColour(13, 60) >= 0
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
End Sub


Sub CCBuildEngineDemonstration
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
End Sub


Sub CCBuildHiddenTitleDemonstration
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
End Sub


Sub CCBuildVisibleTitleDemonstration
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
End Sub


Sub CCBuildPlotDemonstration
    Dim I As Integer

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
    For I = 140 To 40 Step -10
        CCPlotBegin
        CCSendPlot2 I, 1
    Next I
    CCPlotBegin
    CCSend 255

    ' [1346]-form vertical time ticks with persistent Y0.
    CCPlotBegin
    CCSendPlot3 2, 246, 34
    For I = 1 To 141 Step 20
        CCPlotBegin
        CCSendPlot2 I + 10, 35
    Next I
    CCPlotBegin
    CCSend 255
End Sub


Sub CCSend1010
    ' [1010] PLOT 6,39,12,30,22,14
    CCPlotBegin
    CCSendPlot6 6, 39, 12, 30, 22, 14
End Sub


Sub CCSendPlot2 (A As Integer, B As Integer)
    CCSend A
    CCSend B
End Sub


Sub CCSendPlot3 (A As Integer, B As Integer, C As Integer)
    CCSend A
    CCSend B
    CCSend C
End Sub


Sub CCSendPlot4 (A As Integer, B As Integer, C As Integer, D As Integer)
    CCSend A
    CCSend B
    CCSend C
    CCSend D
End Sub


Sub CCSendPlot6 (A As Integer, B As Integer, C As Integer, D As Integer, E As Integer, F As Integer)
    CCSend A
    CCSend B
    CCSend C
    CCSend D
    CCSend E
    CCSend F
End Sub


Sub CCSendPlot7 (A As Integer, B As Integer, C As Integer, D As Integer, E As Integer, F As Integer, G As Integer)
    CCSend A
    CCSend B
    CCSend C
    CCSend D
    CCSend E
    CCSend F
    CCSend G
End Sub


Function CCCountGraphicsBlocks&
    Dim X As Integer
    Dim Y As Integer
    Dim CountValue As Long

    For Y = 0 To CC_GFX_ROWS - 1
        For X = 0 To CC_GFX_COLS - 1
            If CCGraphicsColour(X, Y) >= 0 Then CountValue = CountValue + 1
        Next X
    Next Y
    CCCountGraphicsBlocks& = CountValue
End Function


Function CCTextAt% (Column As Integer, Row As Integer, CharacterCode As Integer)
    CCTextAt% = 0
    If Column < 0 Or Column >= CC_TEXT_COLS Then Exit Function
    If Row < 0 Or Row >= CC_TEXT_ROWS Then Exit Function
    If CCCellKind(Column, Row) <> CC_CELL_TEXT Then Exit Function
    If CCTextCode(Column, Row) = CharacterCode Then CCTextAt% = -1
End Function


Sub DIVERInteractiveStartup
    Dim BASIC_I As Single
    Dim BASIC_J As Integer
    Dim BASIC_Y1 As Integer
    Dim BASIC_YO As Integer
    Dim InputValue As String

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
    For BASIC_I = 0 To 5
        ' [1050-1070] PRINT 79 spaces
        For BASIC_J = 0 To 78
            CCWriteText " "
        Next BASIC_J

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
    Next BASIC_I

    ' [1100] PLOT 30,16
    CCPlotBegin
    CCSend 30
    CCSend 16

    ' [1210-1260] Clear five rows of the Dive Monitor area.
    For BASIC_I = 1 To 5
        ' [1230] PLOT 3,66,I*2
        CCPlotBegin
        CCSend 3
        CCSend 66
        CCSend BASIC_I * 2

        ' [1240-1255] PRINT thirteen spaces
        For BASIC_J = 66 To 78
            CCWriteText " "
        Next BASIC_J
    Next BASIC_I

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
    For BASIC_I = 140 To 40 Step -10
        CCPlotBegin
        CCSend BASIC_I
        CCSend 1
    Next BASIC_I

    ' [1277] PLOT 255
    CCPlotBegin
    CCSend 255

    ' [1278-1281] Ring the warning bell, then repeat GOSUB 5000 until
    ' the entered working depth is greater than zero and less than 50.
    Do
        Beep
        CCPlotBegin
        CCSend 6
        CCSend 48
        InputValue = DIVERReadInput$("WORKING DEPTH ")
        BASIC_WD = Val(InputValue)
        DIVERClearInputLine 14
        If BASIC_WD <= 0 Or BASIC_WD >= 50 Then CCScenario = "WORKING DEPTH must be 1-49"
    Loop While BASIC_WD <= 0 Or BASIC_WD >= 50

    ' [1300-1301] Initial simulation values.
    BASIC_DR = 30
    BASIC_AR = 15
    BASIC_AD = 0
    BASIC_CL = 0

    ' [1303-1309] INPUT time mode. Only the literal REAL selects TK=1/32;
    ' every other answer follows the source ACCELERATED path with TK=.25.
    CCScenario = "Waiting for TIME MODE"
    Beep
    BASIC_TimeMode = UCase$(DIVERReadInput$("TIME MODE (REAL OR ACCELERATED)? "))
    DIVERClearInputLine 50
    If BASIC_TimeMode = "REAL" Then
        BASIC_TK = 1 / 32
    Else
        BASIC_TK = .25
    End If

    ' [1316-1317] IK=TK:IF IK<0.5 THEN IK=0.5
    BASIC_IK = BASIC_TK
    If BASIC_IK < .5 Then BASIC_IK = .5

    ' [1320-1345] Select the source time and depth scales.
    BASIC_XS = 1
    If BASIC_WD < 17 Then BASIC_XS = .5
    If BASIC_WD > 20 Then BASIC_XS = 2
    BASIC_YS = 2

    ' [1346] PLOT 6,38,2,246,34
    CCPlotBegin
    CCSend 6
    CCSend 38
    CCSend 2
    CCSend 246
    CCSend 34

    ' [1348] FOR I=1 TO 150 STEP XS*10:PLOT I+10,35:NEXT I:PLOT 255
    For BASIC_I = 1 To 150 Step BASIC_XS * 10
        CCPlotBegin
        CCSend BASIC_I + 10
        CCSend 35
    Next BASIC_I
    CCPlotBegin
    CCSend 255

    ' [1360-1361] PLOT 3,27,40:PRINT "TIME AT 10 MINUTE INTERVALS";
    CCPlotBegin
    CCSend 3
    CCSend 27
    CCSend 40
    CCWriteText "TIME AT 10 MINUTE INTERVALS"

    ' [1362-1368] CO=1:FL=0 and six GOSUB 7000 calls spell NOSTOP.
    DIVERDisplayMonitorCell 1, Asc("N"), 1, 0
    DIVERDisplayMonitorCell 2, Asc("O"), 1, 0
    DIVERDisplayMonitorCell 3, Asc("S"), 1, 0
    DIVERDisplayMonitorCell 4, Asc("T"), 1, 0
    DIVERDisplayMonitorCell 5, Asc("O"), 1, 0
    DIVERDisplayMonitorCell 6, Asc("P"), 1, 0

    ' [1349-1355] Remaining display state used by the initial gauge calls.
    BASIC_AY = -1
    BASIC_LA = 0

    ' [1445] GOSUB 6600:GOSUB 6700
    DIVERGosub6600
    DIVERGosub6700

    DIVERInitialiseDiveTable
    DIVERInitialiseScheduler
    BASIC_DiveRunning = -1
    BASIC_NextWallTick = Timer(.001) + .6
    CCScenario = "DESCEND ready; first [1465] pass pending"
End Sub


Sub DIVERInitialiseDiveTable
    Dim I As Integer
    Dim J As Integer

    Restore DIVERDiveTableData
    For I = 1 To 21
        For J = 1 To 7
            Read BASIC_DT(I, J)
        Next J
    Next I

    ' [150] C(1..7) is the source's colour-attribute permutation.
    BASIC_C(1) = 20
    BASIC_C(2) = 23
    BASIC_C(3) = 18
    BASIC_C(4) = 22
    BASIC_C(5) = 19
    BASIC_C(6) = 17
    BASIC_C(7) = 16
End Sub


Sub DIVERInitialiseScheduler
    Dim I As Integer
    Dim J As Integer

    ' [1370] DIM PA(8,5); [1371] seed the initial DESCEND request.
    For I = 0 To 8
        For J = 0 To 5
            BASIC_PA(I, J) = 0
        Next J
    Next I
    BASIC_PA(1, 1) = 1
    BASIC_PA(1, 2) = BASIC_DR
    BASIC_PA(1, 3) = 0
    BASIC_PA(1, 4) = BASIC_WD
    BASIC_PA(1, 5) = 3
    BASIC_PA_scalar = 1 ' [1410] PA=1

    ' [1416-1440] Initialise the event stack and its pointer.
    For I = 0 To 30
        For J = 0 To 2
            BASIC_ES(I, J) = 0
        Next J
    Next I
    BASIC_ES(0, 1) = 0
    BASIC_ES(0, 2) = 0
    BASIC_ES(1, 1) = 0
    BASIC_ES(1, 2) = 0
    BASIC_ES_scalar = 1
    BASIC_EP = 0

    ' [1460] DIM AL(15,7); [1320] LM=0.
    For I = 0 To 15
        For J = 0 To 7
            BASIC_AL(I, J) = 0
        Next J
    Next I
    BASIC_AL_scalar = 0
    BASIC_P = 0
    BASIC_CK = 0
    BASIC_LM = 0
End Sub


Sub DIVERAdvanceSchedulerTick
    If Not BASIC_DiveRunning Then Exit Sub

    BASIC_WorkStartedThisPass = 0
    BASIC_TickCount = BASIC_TickCount + 1

    ' [1465] Preserve the pre-pass clock and depth for GOSUB 6300.
    BASIC_AA = BASIC_CL
    BASIC_BB = BASIC_AD

    ' [1466-1470] End-event passes do not advance CL. Ordinary passes do.
    If BASIC_ES(BASIC_EP, 1) <> 1 Then
        BASIC_CL = BASIC_CL + BASIC_TK
        If BASIC_TK <> 1 Then
            If BASIC_CL - Int(BASIC_CL) >= .999 Then BASIC_CL = Int(BASIC_CL) + 1
            If BASIC_CL - Int(BASIC_CL) <= .001 Then BASIC_CL = Int(BASIC_CL)
        End If
    End If

    ' [1471-2200] A due end event may construct a successor and immediately
    ' loop back to activate its type-0 start event without another clock step.
    DIVERDispatchDueEvents
    If BASIC_WorkStartedThisPass Or Not BASIC_DiveRunning Then Exit Sub
    If BASIC_AL_scalar < 1 Then Exit Sub

    ' [3010-3036] Ask early enough for the current activity to keep moving
    ' after the answer while the stored successor waits for the true boundary.
    DIVERPredictiveActivityPrompt
    If Not BASIC_DiveRunning Then Exit Sub

    ' [3400-3408] Advance DESCEND or ASCEND and clamp at the activity target.
    If BASIC_AL(BASIC_AL_scalar, 1) = 1 Then
        If BASIC_AD + BASIC_DR * BASIC_TK > BASIC_AL(BASIC_AL_scalar, 4) Then
            BASIC_AD = BASIC_AL(BASIC_AL_scalar, 4)
        Else
            BASIC_AD = BASIC_AD + BASIC_DR * BASIC_TK
        End If
    ElseIf BASIC_AL(BASIC_AL_scalar, 1) = 2 Then
        If BASIC_AD - BASIC_AR * BASIC_TK < BASIC_AL(BASIC_AL_scalar, 4) Then
            BASIC_AD = BASIC_AL(BASIC_AL_scalar, 4)
        Else
            BASIC_AD = BASIC_AD - BASIC_AR * BASIC_TK
        End If
    End If

    ' [3410], [3510], [3520] retain the verified Stage 4 display path.
    DIVERPlotCurrentProfileTick
    DIVERGosub6600
    DIVERGosub6700
    DIVERGosub6750 ' [3530]

    ' [3530-3540] Type 4 skips GOSUB 6750's type-1/type-3 display and then
    ' counts down the total decompression requirement in GOSUB 6800.
    If BASIC_AL(BASIC_AL_scalar, 1) = 4 Then
        DIVERGosub6800
        BASIC_DecompressPassCount = BASIC_DecompressPassCount + 1
        CCScenario = "DECOMPRESS pass" + Str$(BASIC_DecompressPassCount) + " complete at CL=" + LTrim$(Str$(BASIC_CL))
        Exit Sub
    End If

    If BASIC_AL(BASIC_AL_scalar, 1) = 3 Then
        BASIC_WorkTickCount = BASIC_WorkTickCount + 1
        CCScenario = "WORK fragment" + Str$(BASIC_WorkFragmentCount) + ": tick" + Str$(BASIC_WorkTickCount) + ", bands" + Str$(BASIC_BandBarCount)
    ElseIf BASIC_AL(BASIC_AL_scalar, 1) = 2 Then
        BASIC_AscendTickCount = BASIC_AscendTickCount + 1
        CCScenario = "ASCEND pass" + Str$(BASIC_AscendTickCount) + " complete at CL=" + LTrim$(Str$(BASIC_CL))
    ElseIf BASIC_AL(BASIC_AL_scalar, 1) = 5 Then
        BASIC_RestPassCount = BASIC_RestPassCount + 1
        CCScenario = "REST pass" + Str$(BASIC_RestPassCount) + " complete at CL=" + LTrim$(Str$(BASIC_CL))
    ElseIf BASIC_AD >= BASIC_AL(BASIC_AL_scalar, 4) Then
        BASIC_AD = BASIC_AL(BASIC_AL_scalar, 4)
        BASIC_DescendComplete = -1
        CCScenario = "Physical bottom reached; end event still pending"
    ElseIf BASIC_PromptAnswered Then
        CCScenario = "Successor stored; DESCEND continues"
    Else
        CCScenario = "DESCEND tick" + Str$(BASIC_TickCount)
    End If
End Sub


Sub DIVERDispatchDueEvents
    Dim DispatchGuard As Integer

    Do While BASIC_CL >= BASIC_ES(BASIC_EP, 2) And BASIC_DiveRunning
        DispatchGuard = DispatchGuard + 1
        If DispatchGuard > 4 Then
            BASIC_DiveRunning = 0
            CCScenario = "Stage 18 dispatch guard stopped an invalid loop"
            Exit Sub
        End If

        BASIC_EP = BASIC_EP + 1 ' [1476]
        If BASIC_ES(BASIC_EP, 1) = 1 Then
            DIVEREndCurrentActivity ' [1605] -> [1800]
        Else
            DIVERStartPendingActivity ' [1605] -> [1630]
        End If

        ' WorkStartedThisPass is reset at the top of every scheduler pass.
        ' Unlike the persistent WorkActivated display state, it stops only
        ' the pass that actually started a WORK fragment.
        If BASIC_WorkStartedThisPass Then Exit Sub
    Loop
End Sub


Sub DIVERStartPendingActivity
    Dim I As Integer
    Dim ActivityType As Integer

    If BASIC_PA_scalar < 1 Then
        BASIC_DiveRunning = 0
        CCScenario = "No pending activity available at start event"
        Exit Sub
    End If

    BASIC_AL_scalar = BASIC_AL_scalar + 1 ' [1630]
    For I = 1 To 5 ' [1640-1650]
        BASIC_AL(BASIC_AL_scalar, I) = BASIC_PA(BASIC_PA_scalar, I)
    Next I
    BASIC_PA_scalar = BASIC_PA_scalar - 1 ' [1651]
    BASIC_P = BASIC_AL_scalar ' [1652]
    BASIC_AL(BASIC_P, 6) = BASIC_CL ' [1660]
    ActivityType = BASIC_AL(BASIC_P, 1)

    Select Case ActivityType ' [1665]
        Case 1 ' [1670] DESCEND
            BASIC_AL(BASIC_P, 7) = BASIC_AL(BASIC_P, 6) + (BASIC_AL(BASIC_P, 4) - BASIC_AL(BASIC_P, 3)) / BASIC_AL(BASIC_P, 2)
        Case 2 ' [1680] ASCEND
            BASIC_AL(BASIC_P, 7) = BASIC_AL(BASIC_P, 6) + (BASIC_AL(BASIC_P, 3) - BASIC_AL(BASIC_P, 4)) / BASIC_AL(BASIC_P, 2)
            ' [1682] Clear the six-character third Dive Monitor row as the
            ' ascent becomes current, before its first movement/display pass.
            For I = 13 To 18
                DIVERDisplayMonitorCell I, 32, 0, 0
            Next I
        Case 3, 5 ' [1690], [1710]
            BASIC_AL(BASIC_P, 7) = BASIC_AL(BASIC_P, 6) + BASIC_AL(BASIC_P, 2)
        Case 4 ' [1700-1705] DECOMPRESS
            BASIC_AL(BASIC_P, 7) = BASIC_AL(BASIC_P, 6) + BASIC_AL(BASIC_P, 2)
            DIVERGosub6250
    End Select

    BASIC_ES(BASIC_EP, 2) = BASIC_AL(BASIC_P, 7) ' [1730]
    BASIC_ES_scalar = BASIC_ES_scalar + 1 ' [1740]
    BASIC_ES(BASIC_ES_scalar, 1) = 1 ' [1765]
    BASIC_ES(BASIC_ES_scalar, 2) = BASIC_AL(BASIC_P, 7)
    BASIC_CK = 0 ' [1789]

    If ActivityType = 3 Then
        ' [1691-1695] Initialise decompression state and the Dive Monitor for
        ' this WORK fragment before its first ordinary display pass.
        BASIC_BT = BASIC_AL(BASIC_AL_scalar, 7) ' [1691]
        DIVERGosub6100
        If Not BASIC_DiveRunning Then Exit Sub
        DIVERGosub6950
        DIVERGosub6850
        DIVERGosub6950
        BASIC_E5 = BASIC_D5
        BASIC_EX = BASIC_DX
        BASIC_WorkActivated = -1
        BASIC_WorkStartedThisPass = -1
        BASIC_WorkFragmentCount = BASIC_WorkFragmentCount + 1
        CCScenario = "WORK fragment" + Str$(BASIC_WorkFragmentCount) + " active; [1691-1695] complete"
    ElseIf ActivityType = 2 Then
        ' [1680-1789] is complete; [1790] now enters the translated ASCEND
        ' display pass in the same scheduler dispatch.
        CCScenario = "ASCEND activated; [1790] display pass pending"
    ElseIf ActivityType = 4 Then
        ' [1700-1789], including GOSUB 6250, is complete. The same scheduler
        ' pass follows [1790] into DECOMPRESS's first display pass.
        CCScenario = "DECOMPRESS activated; [1790] display pass pending"
    ElseIf ActivityType = 5 Then
        ' [1710-1790] REST continues into its first display pass.
        CCScenario = "REST activated; [1790] display pass pending"
    End If
End Sub


Sub DIVEREndCurrentActivity
    Dim InputValue As String
    Dim Answer As String
    Dim BASIC_M As Single

    ' [1800-1820] REST terminates the dive before [1881] queues a successor.
    If BASIC_AL(BASIC_AL_scalar, 1) = 5 Then
        DIVERGosub8000
        BASIC_DiveEnded = -1
        BASIC_DiveRunning = 0
        CCScenario = "Dive complete; MEMORY displayed at CL=" + LTrim$(Str$(BASIC_CL))
        Exit Sub
    End If

    ' [1881-1882] Queue the type-0 event which starts the successor.
    BASIC_ES_scalar = BASIC_ES_scalar + 1
    BASIC_ES(BASIC_ES_scalar, 1) = 0
    BASIC_ES(BASIC_ES_scalar, 2) = 0

    ' [1888] A completed DECOMPRESS updates the monitor and advances the
    ' active stop before [1895-2110] constructs its default ASCEND successor.
    If BASIC_AL(BASIC_AL_scalar, 1) = 4 Then
        DIVERGosub7500
        BASIC_DecompressCompleted = -1
        BASIC_DecompressCompletionCount = BASIC_DecompressCompletionCount + 1
    End If

    ' [1890-1893] A blank predictive answer at an intermediate WORK
    ' boundary selects the stored WORK default. If the PA stack still holds
    ' another table-derived fragment, retain that stack and ask [5503-5505]
    ' whether its duration is required instead of asking for BOTTOM TIME.
    If BASIC_NA = 0 And BASIC_AL(BASIC_AL_scalar, 5) = 3 Then
        BASIC_NA = 3
        If BASIC_PA_scalar >= 1 Then
            Beep
            Answer = UCase$(DIVERReadInput$("IS NEXT STAGE =" + LTrim$(Str$(BASIC_PA(BASIC_PA_scalar, 2))) + " MIN. REQUIRED "))
            DIVERClearInputLine 48
            If Answer = "NO" Then
                BASIC_DiveRunning = 0
                CCScenario = "Stage 18 does not yet implement [5509] replacement BT"
            End If
            Exit Sub
        End If
    End If

    ' [1895] An unrecognised or blank predictive answer uses the activity's
    ' stored default. Initial DESCEND therefore defaults to WORK.
    If BASIC_NA = 0 Then BASIC_NA = BASIC_AL(BASIC_AL_scalar, 5)

    BASIC_PA_scalar = 1 ' [1900]
    BASIC_PA(1, 1) = BASIC_NA ' [1905]
    BASIC_PA(1, 3) = BASIC_AL(BASIC_AL_scalar, 4) ' [1910]

    Select Case BASIC_NA ' [2010]
        Case 2 ' [2050] GOSUB 5400 - ASCEND to the current stop depth
            BASIC_PA(1, 2) = BASIC_AR
            BASIC_PA(1, 4) = BASIC_HT ' [5420]
            BASIC_PA(1, 5) = 5 ' [5430] REST at the surface
            If BASIC_HT <> 0 Then BASIC_PA(1, 5) = 4 ' [5450] DECOMPRESS at HT

        Case 3 ' [2080-2085] GOSUB 5500 - initial WORK request
            BASIC_PA(1, 2) = -1
            Beep
            InputValue = DIVERReadInput$("BOTTOM TIME ") ' [5509] GOSUB 5000
            BASIC_BottomTime = Val(InputValue)
            DIVERClearInputLine 14

            If BASIC_BottomTime > 0 Then
                BASIC_PA(1, 2) = BASIC_BottomTime
                BASIC_PA(1, 4) = BASIC_PA(1, 3) ' [5520]
                BASIC_PA(1, 5) = 2 ' [5530]
                DIVERBuildWorkStack ' [5550] GOSUB 5900
            Else
                ' [5515] A non-positive BOTTOM TIME assumes ASCEND, not WORK.
                BASIC_PA(1, 1) = 2
                BASIC_PA(1, 2) = BASIC_AR
                BASIC_PA(1, 4) = 0
                BASIC_PA(1, 5) = 5
            End If

        Case 4 ' [2110] GOSUB 5600 - DECOMPRESS at the current ceiling
            BASIC_PA(1, 2) = BASIC_DX ' [5610]
            If BASIC_HT = 5 Then BASIC_PA(1, 2) = BASIC_D5 ' [5615]
            BASIC_PA(1, 4) = BASIC_PA(1, 3) ' [5620]
            BASIC_PA(1, 5) = 2 ' [5640] ASCEND after the stop

        Case 5 ' [2140] GOSUB 5700 - REST NEXT
            Beep ' [5705]
            InputValue = DIVERReadInput$("FOR HOW LONG ") ' [5710] GOSUB 5000
            BASIC_M = Val(InputValue)
            DIVERClearInputLine 24
            BASIC_PA(1, 2) = BASIC_M ' [5710] stored before M is adjusted
            If BASIC_M < 2 * BASIC_TK Then BASIC_M = 2 * BASIC_TK ' [5715]
            BASIC_PA(1, 4) = BASIC_PA(1, 3) ' [5720]
            BASIC_PA(1, 5) = 5 ' [5730]

        Case Else
            BASIC_DiveRunning = 0
            CCScenario = "Stage 18 successor path not yet implemented"
    End Select
End Sub


Sub DIVERPredictiveActivityPrompt
    Dim Answer As String
    Dim DefaultActivity As String

    If BASIC_CK <> 0 Then Exit Sub ' [3015]
    If BASIC_CL < BASIC_ES(BASIC_EP, 2) - BASIC_IK Then Exit Sub ' [3010]
    If BASIC_AL(BASIC_AL_scalar, 1) = 5 Then
        BASIC_CK = 1 ' [3022]
        Exit Sub
    End If

    BASIC_CK = 1 ' [3025]
    If BASIC_AL(BASIC_AL_scalar, 1) = 3 Then DIVERGosub6200 ' [3017]
    Select Case BASIC_AL(BASIC_AL_scalar, 5)
        Case 1: DefaultActivity = "DESCEND"
        Case 2: DefaultActivity = "ASCEND"
        Case 3: DefaultActivity = "WORK"
        Case 4: DefaultActivity = "DECOMPRESS"
        Case 5: DefaultActivity = "REST"
    End Select
    Beep
    Answer = UCase$(DIVERReadInput$("WHICH ACTIVITY REQUIRED (" + DefaultActivity + ") ")) ' [3031-3032]
    DIVERClearInputLine 48

    Select Case Answer ' [3034-3036]
        Case ""
            ' [3036] Leave NA=0. At the true boundary [1895] replaces it
            ' with the current activity's displayed stored default.
            BASIC_NA = 0
        Case "ASCEND": BASIC_NA = 2
        Case "WORK": BASIC_NA = 3
        Case "DECOMPRESS": BASIC_NA = 4
        Case "REST": BASIC_NA = 5
        Case Else
            BASIC_NA = 0
            BASIC_DiveRunning = 0
            CCScenario = "Stage 18 test requires the displayed default"
    End Select
    BASIC_PromptAnswered = -1
End Sub


Sub DIVERBuildWorkStack
    Dim BASIC_I As Integer
    Dim BASIC_J As Integer
    Dim BASIC_K As Integer
    Dim BASIC_L As Integer
    Dim BASIC_M As Integer
    Dim BASIC_TT As Single

    ' [5900-5999] Divide WORK at the dive-table boundaries crossed by the
    ' requested bottom time. PA remains a LIFO stack, as in the source.
    If BASIC_AD < 10 Then Exit Sub ' [5905]
    BASIC_TT = BASIC_PA(1, 2) ' [5910]
    BASIC_I = Int((BASIC_PA(1, 3) - 7) / 2)
    If BASIC_I > 21 Then BASIC_I = 21 ' [5913]

    For BASIC_J = 1 To 7 ' [5915-5930]
        If BASIC_DT(BASIC_I, BASIC_J) = 999 Then
            BASIC_DiveRunning = 0
            CCScenario = "[5931] WORK begins beyond the dive table"
            Exit Sub
        End If
        If BASIC_CL <= BASIC_DT(BASIC_I, BASIC_J) Then Exit For
    Next BASIC_J

    For BASIC_K = 1 To 7 ' [5945-5965]
        If BASIC_DT(BASIC_I, BASIC_K) = 999 Then
            BASIC_PA_scalar = -1 ' [5970]
            BASIC_DiveRunning = 0
            CCScenario = "[5970] WORK duration exceeds the dive table"
            Exit Sub
        End If
        If BASIC_CL + BASIC_TT <= BASIC_DT(BASIC_I, BASIC_K) Then Exit For
    Next BASIC_K

    If BASIC_J <> BASIC_K Then
        BASIC_PA(1, 2) = BASIC_CL + BASIC_TT - BASIC_DT(BASIC_I, BASIC_K - 1) ' [5976]
        If BASIC_K - BASIC_J > 1 Then
            BASIC_M = BASIC_K - BASIC_J + 1
            For BASIC_L = BASIC_J + 1 To BASIC_K - 1 ' [5981-5984]
                BASIC_M = BASIC_M - 1
                BASIC_PA(BASIC_M, 2) = BASIC_DT(BASIC_I, BASIC_L) - BASIC_DT(BASIC_I, BASIC_L - 1)
            Next BASIC_L
        End If

        BASIC_PA_scalar = BASIC_K - BASIC_J + 1 ' [5985]
        BASIC_PA(BASIC_PA_scalar, 2) = BASIC_DT(BASIC_I, BASIC_J) - BASIC_CL ' [5986]

        For BASIC_K = 2 To BASIC_PA_scalar ' [5991-5997]
            BASIC_PA(BASIC_K, 1) = BASIC_PA(1, 1)
            BASIC_PA(BASIC_K, 3) = BASIC_PA(1, 3)
            BASIC_PA(BASIC_K, 4) = BASIC_PA(1, 4)
            BASIC_PA(BASIC_K, 5) = 3
        Next BASIC_K
    End If

    BASIC_PA(1, 5) = 2 ' [5998] final stack successor is ASCEND
End Sub


Sub DIVERPlotCurrentProfileTick
    Dim BASIC_LP As Integer
    Dim BASIC_LQ As Integer
    Dim BASIC_MP As Integer
    Dim BASIC_MQ As Integer
    Dim BASIC_ActualRise As Single
    Dim BASIC_NominalRise As Single
    Dim BASIC_AtTarget As Integer
    Dim BASIC_IsShortFinalRise As Integer
    Dim BASIC_HasPrecedingRise As Integer

    ' [6310] Source time-axis endpoints.
    BASIC_LP = Int(BASIC_AA * BASIC_XS) + 10
    BASIC_LQ = Int(BASIC_CL * BASIC_XS) + 10
    BASIC_LastLP = BASIC_LP
    BASIC_LastLQ = BASIC_LQ

    If BASIC_AL(BASIC_AL_scalar, 1) = 3 Then
        DIVERPlotCurrentWorkTick BASIC_LP, BASIC_LQ
        Exit Sub
    End If

    ' [6313] Source depth-axis endpoints.
    BASIC_MP = 140 - Int(BASIC_BB * BASIC_YS)
    BASIC_MQ = 140 - Int(BASIC_AD * BASIC_YS)

    BASIC_LastLP = BASIC_LP
    BASIC_LastLQ = BASIC_LQ
    BASIC_LastMP = BASIC_MP
    BASIC_LastMQ = BASIC_MQ

    ' [6314-6317] Retain the source's rightward and direction guards.
    If BASIC_LQ < BASIC_LM Then Exit Sub
    BASIC_LM = BASIC_LQ
    If BASIC_AL(BASIC_AL_scalar, 1) = 1 And BASIC_MQ > BASIC_MP Then Exit Sub
    If BASIC_AL(BASIC_AL_scalar, 1) = 2 And BASIC_MP > BASIC_MQ Then Exit Sub

    ' Display adapter established by the completed browser reconstruction.
    ' ASCEND occupies the next complete plot column; only a shortened final
    ' rise remains in the preceding stroke group. LP/LQ and MP/MQ themselves
    ' remain the literal source [6310]/[6313] coordinates reported at right.
    CCAscendDisplayColumn = -1
    CCAscendJoinPending = 0
    If BASIC_AL(BASIC_AL_scalar, 1) = 2 Then
        CCAscendDisplayColumn = BASIC_LP + 1
        CCAscendJoinPending = (Abs(BASIC_BB - BASIC_AL(BASIC_AL_scalar, 3)) < .0001)
        BASIC_ActualRise = Abs(BASIC_BB - BASIC_AD)
        BASIC_NominalRise = Abs(BASIC_AR * BASIC_TK)
        BASIC_AtTarget = (Abs(BASIC_AD - BASIC_AL(BASIC_AL_scalar, 4)) < .0001)
        BASIC_IsShortFinalRise = BASIC_AtTarget And BASIC_NominalRise > 0 And BASIC_ActualRise > 0 And BASIC_ActualRise < BASIC_NominalRise - .0001
        BASIC_HasPrecedingRise = (BASIC_AA > BASIC_AL(BASIC_AL_scalar, 6) + .0001)
        If BASIC_IsShortFinalRise And BASIC_HasPrecedingRise Then
            CCAscendDisplayColumn = Int((BASIC_AA - BASIC_TK) * BASIC_XS) + 11
        End If
    End If

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

    ' The accepted ASCEND renderer uses one graph-blue host pixel at the left
    ' of each complete black stroke. Its last stroke intentionally excludes
    ' the source endpoint; DECOMPRESS's first zero-length [6320] vector then
    ' supplies that endpoint. Render this single join block with the same
    ' left edge, while retaining its literal source coordinate and colour.
    If BASIC_AL(BASIC_AL_scalar, 1) = 4 Then
        ' Apply at the first display pass of every DECOMPRESS activity. CL is
        ' the literal AL(P,6) start time on that activation pass.
        If Abs(BASIC_CL - BASIC_AL(BASIC_AL_scalar, 6)) < .0001 And BASIC_LP = BASIC_LQ And BASIC_MP = BASIC_MQ Then
            CCAscendCell(BASIC_LQ, BASIC_MQ) = 1
            CCDecompressJoinAligned = -1
        End If
    ElseIf BASIC_AL(BASIC_AL_scalar, 1) = 5 Then
        ' REST's first [6320] vector is the literal zero-length point at the
        ' ASCEND endpoint. Retain it and apply only the established host-pixel
        ' blue edge so the corner neither projects left nor opens a gap.
        If Abs(BASIC_CL - BASIC_AL(BASIC_AL_scalar, 6)) < .0001 And BASIC_LP = BASIC_LQ And BASIC_MP = BASIC_MQ Then
            CCAscendCell(BASIC_LQ, BASIC_MQ) = 1
            CCRestJoinAligned = -1
        End If
    End If

    BASIC_VectorCount = BASIC_VectorCount + 1
End Sub


Sub DIVERPlotCurrentWorkTick (BASIC_LP As Integer, BASIC_LQ As Integer)
    Dim BASIC_X3 As Integer
    Dim BASIC_Y3 As Integer
    Dim BASIC_XX As Single
    Dim BASIC_Y2 As Integer
    Dim BASIC_Y1 As Integer
    Dim BASIC_C_scalar As Integer
    Dim BASIC_L As Integer
    Dim BASIC_CO As Integer
    Dim BASIC_J As Integer
    Dim BASIC_I As Integer
    Dim BASIC_InBand As Integer
    Dim BASIC_CellX0 As Integer
    Dim BASIC_CellTopY As Integer
    Dim BASIC_EdgeX As Integer
    Dim BASIC_EdgeY As Integer

    ' [6330] WORK remains at the pre-pass physical depth.
    BASIC_Y3 = Int(140 - BASIC_BB * BASIC_YS)
    BASIC_LastMP = BASIC_Y3
    BASIC_LastMQ = BASIC_Y3

    For BASIC_X3 = BASIC_LP To BASIC_LQ ' [6331]
        If BASIC_X3 > BASIC_LM Then ' [6332]
            BASIC_LM = BASIC_X3
            BASIC_XX = (BASIC_X3 - 10) / BASIC_XS - BASIC_TK ' [6333]
            BASIC_Y2 = 140 ' [6345]
            BASIC_C_scalar = 1
            BASIC_L = 1 ' [6346]
            BASIC_CO = 1

            For BASIC_J = 1 To 7 ' [6350]
                CCPlotBegin ' [6355] PLOT 30,20
                CCSend 30
                CCSend 20

                BASIC_I = BASIC_L ' [6360-6375]
                Do While BASIC_I <= 21
                    If BASIC_DT(BASIC_I, BASIC_J) = 999 Or BASIC_DT(BASIC_I, BASIC_J) < BASIC_XX Then Exit Do
                    BASIC_I = BASIC_I + 1
                Loop

                BASIC_Y1 = Int(140 - (2 * BASIC_I + 8) * BASIC_YS) ' [6380]
                BASIC_Y1 = BASIC_Y1 + 2 ' [6381]
                If BASIC_Y1 = 42 Then BASIC_Y1 = 40
                If BASIC_Y1 < 40 Then BASIC_Y1 = 40 ' [6385]

                If Not (BASIC_Y3 < BASIC_Y1 Or BASIC_Y3 > BASIC_Y2) Then BASIC_CO = BASIC_C_scalar ' [6390-6400]

                If BASIC_C_scalar <> 1 Then ' [6500-6525]
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
                End If

                If BASIC_Y1 = 40 Or BASIC_C_scalar = 7 Then Exit For ' [6540]
                If BASIC_I <= 21 Then
                    If BASIC_DT(BASIC_I, BASIC_J) = 999 Then Exit For ' [6541]
                End If
                BASIC_Y2 = BASIC_Y1 - 1 ' [6550]
                BASIC_C_scalar = BASIC_C_scalar + 1 ' [6560]
                BASIC_L = BASIC_I ' [6565]
            Next BASIC_J

            ' [6590] Restore the selected band background and black foreground.
            BASIC_InBand = (BASIC_CO > 1)
            CCPlotBegin
            CCSend 30
            CCSend BASIC_C(BASIC_CO)
            CCSend 29
            CCSend 16
            CCSend 29

            ' [6591] Plot the diver's WORK-position cell at this X3 column.
            CCPlotBegin
            CCSend 2
            CCSend 253
            CCSend BASIC_X3
            CCSend BASIC_Y3
            CCSend 255
            BASIC_WorkDotCount = BASIC_WorkDotCount + 1

            ' [6590-6591] can give the two graphics columns in one text cell
            ' a band-coloured background. Preserve that background at Y3 so
            ' v04's cleared points remain visible as white dash gaps. Only
            ' unset blocks above the track are made explicitly blue; existing
            ' white/green band blocks and retained black points are untouched.
            If BASIC_InBand Then
                BASIC_CellX0 = (BASIC_X3 \ 2) * 2
                BASIC_CellTopY = (BASIC_Y3 \ 4) * 4 + 3
                For BASIC_EdgeX = BASIC_CellX0 To BASIC_CellX0 + 1
                    For BASIC_EdgeY = BASIC_Y3 + 1 To BASIC_CellTopY
                        If CCGraphicsColour(BASIC_EdgeX, BASIC_EdgeY) < 0 Then CCGraphicsColour(BASIC_EdgeX, BASIC_EdgeY) = 4
                    Next BASIC_EdgeY
                Next BASIC_EdgeX
            End If

            ' Visible-result adapter for the Compucolor attribute interaction
            ' at [6590-6591]. The source still issues every point. When CO>1,
            ' however, the accepted browser reconstruction and photograph show
            ' a dash/space track across the coloured mountain. At this raster
            ' resolution, clearing alternate even X3 cells reproduces that
            ' established result while leaving the source counters unchanged.
            ' The cell retains C(CO) as its background, so the cleared point
            ' exposes the underlying band rather than cutting a blue hole.
            If BASIC_InBand And (BASIC_X3 Mod 2) = 0 Then
                CCGraphicsColour(BASIC_X3, BASIC_Y3) = -1
                BASIC_WorkGapCount = BASIC_WorkGapCount + 1
            End If
        End If
    Next BASIC_X3 ' [6593]
End Sub


Sub DIVERGosub6200
    Dim Chars As String
    Dim Index As Integer

    ' [6200-6240] A predictive prompt during WORK first refreshes the
    ' third Dive Monitor row with AIR OK in green.
    Chars = "AIR OK"
    For Index = 1 To 6
        DIVERDisplayMonitorCell 12 + Index, Asc(Mid$(Chars, Index, 1)), 1, 0
    Next Index
End Sub


Sub DIVERGosub6250
    Dim BASIC_I As Single
    Dim BASIC_ID As Integer
    Dim BASIC_VA As Integer

    ' [6250-6299] Display the decompression requirement at this depth.
    If BASIC_HT <= 5 Then Exit Sub ' [6257]

    ' [6260] The source assigns I but subsequently prints D5. Preserve that
    ' apparently unused assignment rather than silently modernising it.
    BASIC_I = BASIC_D5
    If BASIC_HT = 10 Then BASIC_I = BASIC_DX

    BASIC_ID = 13: BASIC_VA = 53: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0 ' 5
    BASIC_ID = 14: BASIC_VA = 77: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0 ' M
    BASIC_ID = 15: BASIC_VA = 32: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = 16
    BASIC_VA = Int(BASIC_D5 / 10) + 48
    If BASIC_VA = 48 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = 17
    BASIC_VA = BASIC_D5 - Int(BASIC_D5 / 10) * 10 + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = 18: BASIC_VA = 58: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0 ' :
End Sub


Sub DIVERGosub6100
    Dim BASIC_I As Integer
    Dim BASIC_J As Integer
    Dim BASIC_L As Integer
    Dim FoundJ As Integer
    Dim FoundL As Integer

    BASIC_I = Int((BASIC_AL(BASIC_AL_scalar, 3) - 7) / 2) ' [6125]
    If BASIC_I < 1 Then BASIC_I = 1 ' [6127]

    For BASIC_J = 1 To 7 ' [6135-6150]
        If BASIC_DT(BASIC_I, BASIC_J) = 999 Then Exit For
        If BASIC_WE <= BASIC_DT(BASIC_I, BASIC_J) Then
            FoundJ = -1
            Exit For
        End If
    Next BASIC_J
    If Not FoundJ Then
        BASIC_DiveRunning = 0
        CCScenario = "[6181] OUT OF RANGE in GOSUB 6100"
        Exit Sub
    End If

    For BASIC_L = 1 To 7 ' [6165-6180]
        If BASIC_DT(BASIC_I, BASIC_L) = 999 Then Exit For
        If BASIC_AL(BASIC_AL_scalar, 7) <= BASIC_DT(BASIC_I, BASIC_L) Then
            FoundL = -1
            Exit For
        End If
    Next BASIC_L
    If Not FoundL Then
        BASIC_DiveRunning = 0
        CCScenario = "[6181] OUT OF RANGE in GOSUB 6100"
        Exit Sub
    End If

    ' [6851] GOSUB 6850 later reuses these final I and L values.
    BASIC_I6 = BASIC_I
    BASIC_L2 = BASIC_L
    BASIC_WE = BASIC_AL(BASIC_AL_scalar, 7) ' [6185]
    If BASIC_AL(BASIC_AL_scalar, 3) > 20 And BASIC_L > 1 Then BASIC_DX = 5 ' [6190]
    If BASIC_DX <> 0 Then BASIC_HT = 10 ' [6191]
    If BASIC_J = BASIC_L Then Exit Sub ' [6193]
    BASIC_D5 = BASIC_D5 + (BASIC_L - BASIC_J) * 5 ' [6194]
    If BASIC_DX = 0 Then BASIC_HT = 5 ' [6195]
End Sub


Sub DIVERGosub6950
    Dim Chars As String
    Dim I As Integer

    If BASIC_HT = 0 Then Exit Sub ' [6955]
    If BASIC_DX <> 0 Then
        Chars = "STOP10"
    Else
        Chars = "STOP 5"
    End If
    For I = 1 To 6 ' [6956-6962]
        DIVERDisplayMonitorCell I, Asc(Mid$(Chars, I, 1)), 0, 0
    Next I
End Sub


Sub DIVERWriteBoundTime (BASIC_II As Integer, BASIC_NN As Single)
    Dim BASIC_ID As Integer
    Dim BASIC_J As Single
    Dim BASIC_VA As Integer

    BASIC_ID = BASIC_II + 7 ' [6855]
    BASIC_VA = Int(BASIC_NN / 100) + 48
    If BASIC_VA = 48 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = BASIC_II + 8 ' [6856]
    BASIC_J = BASIC_NN - Int(BASIC_NN / 100) * 100
    BASIC_VA = Int(BASIC_J / 10) + 48
    If BASIC_VA = 48 And BASIC_NN < 100 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = BASIC_II + 9 ' [6857]
    BASIC_VA = Int(BASIC_J - Int(BASIC_J / 10) * 10) + 48
    If BASIC_VA = 48 And BASIC_NN < 10 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = BASIC_II + 10 ' [6858]
    BASIC_VA = 58
    If BASIC_NN = 0 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_J = (BASIC_NN - Int(BASIC_NN)) * 60
    BASIC_ID = BASIC_II + 11 ' [6859]
    BASIC_VA = Int(BASIC_J / 10) + 48
    If BASIC_NN = 0 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0

    BASIC_ID = BASIC_II + 12 ' [6860]
    BASIC_VA = Int(BASIC_J - Int(BASIC_J / 10) * 10) + 48
    If BASIC_NN = 0 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 0, 0
End Sub


Sub DIVERGosub6850
    Dim BASIC_J As Single
    Dim BASIC_NN As Single
    Dim BASIC_VA As Integer

    If BASIC_AL(BASIC_AL_scalar, 7) <= BASIC_DT(BASIC_I6, 1) Then ' [6852]
        BASIC_NN = BASIC_DT(BASIC_I6, 1) - BASIC_CL ' [6854]
        If BASIC_AD < 10 Then BASIC_NN = 0
        DIVERWriteBoundTime 0, BASIC_NN
        Exit Sub
    End If

    DIVERDisplayMonitorCell 7, 84, 0, 0 ' [6872] T
    BASIC_J = BASIC_D5 + BASIC_DX ' [6873]
    BASIC_VA = Int(BASIC_J / 10) + 48
    If BASIC_VA = 48 Then BASIC_VA = 32
    DIVERDisplayMonitorCell 8, BASIC_VA, 0, 0
    BASIC_VA = Int(BASIC_J - Int(BASIC_J / 10) * 10) + 48
    DIVERDisplayMonitorCell 9, BASIC_VA, 0, 0
    DIVERDisplayMonitorCell 10, 58, 0, 0
    DIVERDisplayMonitorCell 11, 58, 0, 0
    DIVERDisplayMonitorCell 12, 58, 0, 0

    BASIC_NN = BASIC_DT(BASIC_I6, BASIC_L2) - BASIC_CL ' [6881]
    If BASIC_NN < 0 Then BASIC_NN = 0
    DIVERWriteBoundTime 6, BASIC_NN
End Sub


Function DIVERReadInput$ (PromptText As String)
    Dim Buffer As String
    Dim Character As String
    Dim KeyValue As Long
    Dim CursorColumn As Integer
    Dim FinishedInput As Integer

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

    Do
        CCRender
        _Display

        KeyValue = _KeyHit
        Select Case KeyValue
            Case 13
                FinishedInput = -1

            Case 8
                If Len(Buffer) > 0 Then
                    Buffer = Left$(Buffer, Len(Buffer) - 1)
                    CursorColumn = Len(PromptText) + Len(Buffer)
                    CCPlotBegin
                    CCSend 3
                    CCSend CursorColumn
                    CCSend 0
                    CCWriteText " "
                    CCPlotBegin
                    CCSend 3
                    CCSend CursorColumn
                    CCSend 0
                End If

            Case 27
                System

            Case 32 To 126
                If Len(Buffer) < 40 Then
                    Character = UCase$(Chr$(KeyValue))
                    Buffer = Buffer + Character
                    CCWriteText Character
                End If
        End Select

        _Limit 30
    Loop Until FinishedInput

    BASIC_InputActive = 0
    DIVERReadInput$ = Buffer
End Function


Sub DIVERClearInputLine (CharacterCount As Integer)
    ' [5040-5051] and [1305-1306] clear the completed prompt line and Home it.
    CCPlotBegin
    CCSend 3
    CCSend 0
    CCSend 0
    CCWriteText String$(CharacterCount, 32)
    CCPlotBegin
    CCSend 3
    CCSend 0
    CCSend 0
End Sub


Sub DIVERGosub6600
    Dim BASIC_ID As Integer
    Dim BASIC_VA As Integer
    Dim BASIC_FL As Integer

    ' [6600-6699] Initial depth gauge. AD=0 and AY=-1 make the first call run.
    CCPlotBegin
    CCSend 29
    If BASIC_AD = BASIC_AY Then Exit Sub

    BASIC_ID = 19
    BASIC_FL = 0
    BASIC_VA = Int(BASIC_AD / 10) + 48
    If BASIC_VA = 48 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, BASIC_FL

    BASIC_ID = 20
    BASIC_VA = BASIC_AD - Int(BASIC_AD / 10) * 10 + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, BASIC_FL

    BASIC_ID = 21
    BASIC_VA = (BASIC_AD - Int(BASIC_AD)) * 10
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, BASIC_FL
    BASIC_AY = BASIC_AD
End Sub


Sub DIVERGosub6700
    Dim BASIC_ID As Integer
    Dim BASIC_VA As Integer

    ' [6700-6745] Initial air-left gauge. This remains the source's explicitly
    ' described dummy display rate; it is not a physiological calculation.
    BASIC_ID = 22
    BASIC_VA = 13 - Int(BASIC_CL * BASIC_XS / 10)
    If BASIC_VA < 0 Then Exit Sub
    If BASIC_LA = BASIC_VA Then Exit Sub
    BASIC_LA = BASIC_VA
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, 0
End Sub


Sub DIVERGosub6750
    Dim BASIC_I As Integer
    Dim BASIC_II As Integer
    Dim BASIC_J As Integer
    Dim BASIC_NN As Single

    ' [6750-6799] NOSTOP time or time to the next table boundary.
    BASIC_I = BASIC_AL(BASIC_AL_scalar, 1)
    If BASIC_I <> 1 And BASIC_I <> 3 Then Exit Sub
    If BASIC_AD > BASIC_WM Then BASIC_WM = BASIC_AD
    BASIC_J = Int((BASIC_WM - 7) / 2)
    If BASIC_J < 1 Then BASIC_J = 1
    BASIC_NS = BASIC_DT(BASIC_J, 1) - BASIC_CL - BASIC_TK
    If BASIC_WM < 10 Then BASIC_NS = 0
    BASIC_II = 0: BASIC_NN = BASIC_NS
    If BASIC_NS < 0 Then
        For BASIC_I = 2 To 7
            If BASIC_DT(BASIC_J, BASIC_I) <> 999 And BASIC_DT(BASIC_J, BASIC_I) > BASIC_CL Then Exit For
        Next BASIC_I
        If BASIC_I > 7 Then
            BASIC_DiveRunning = 0
            CCScenario = "OUT OF RANGE at [6762-6763]"
            Exit Sub
        End If
        BASIC_NN = BASIC_DT(BASIC_J, BASIC_I) - BASIC_CL - BASIC_TK
        BASIC_II = 6
    End If
    DIVERWriteBoundTime BASIC_II, BASIC_NN
End Sub


Sub DIVERGosub6800
    Dim BASIC_CO As Integer
    Dim BASIC_FL As Integer
    Dim BASIC_ID As Integer
    Dim BASIC_VA As Integer
    Dim BASIC_I As Single
    Dim BASIC_Seconds As Single

    ' [6800-6849] Count down and display total decompression requirements.
    BASIC_CO = 0: BASIC_FL = 0 ' [6804]

    BASIC_ID = 7: BASIC_VA = 84 ' [6805] T
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    ' [6810-6820] HT identifies the active 10 m or 5 m requirement.
    If BASIC_HT = 10 Then
        BASIC_DX = BASIC_DX - BASIC_TK
    Else
        BASIC_D5 = BASIC_D5 - BASIC_TK
    End If

    BASIC_I = BASIC_D5 + BASIC_DX ' [6825]

    BASIC_ID = 8
    BASIC_VA = Int(BASIC_I / 10) + 48
    If BASIC_VA = 48 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    BASIC_ID = 9 ' [6830]
    BASIC_VA = Int(BASIC_I - Int(BASIC_I / 10) * 10) + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    BASIC_ID = 10: BASIC_VA = 58 ' [6835] colon
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    BASIC_Seconds = (BASIC_I - Int(BASIC_I)) * 60 ' [6840]
    BASIC_ID = 11
    ' The source passes these numeric values as plot bytes. INT expresses the
    ' original byte conversion explicitly; it does not change the arithmetic.
    BASIC_VA = Int(BASIC_Seconds / 10) + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL

    BASIC_ID = 12 ' [6845]
    BASIC_VA = Int(BASIC_Seconds - Int(BASIC_Seconds / 10) * 10) + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
End Sub


Sub DIVERGosub7500
    Dim BASIC_CO As Integer
    Dim BASIC_FL As Integer
    Dim BASIC_ID As Integer
    Dim BASIC_VA As Integer

    ' [7500-7549] Subroutine used when a DECOMPRESS activity finishes.
    BASIC_CO = 0: BASIC_FL = 0 ' [7502]

    BASIC_VA = 32 ' [7505]
    For BASIC_ID = 7 To 12
        DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    Next BASIC_ID

    If BASIC_HT = 10 Then ' [7510]
        BASIC_ID = 5: BASIC_VA = 32 ' [7536]
        DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
        BASIC_ID = 6: BASIC_VA = 53 ' [7545]
        DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    Else
        BASIC_CO = 1 ' [7515]
        BASIC_ID = 1: BASIC_VA = 65: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL ' [7520] A
        BASIC_ID = 2: BASIC_VA = 83: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL ' S
        BASIC_ID = 3: BASIC_VA = 67: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL ' [7525] C
        BASIC_ID = 4: BASIC_VA = 69: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL ' E
        BASIC_ID = 5: BASIC_VA = 78: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL ' [7530] N
        BASIC_ID = 6: BASIC_VA = 68: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL ' D
    End If

    BASIC_HT = BASIC_HT - 5 ' [7549]
End Sub


Sub DIVERGosub8000
    Dim BASIC_CO As Integer, BASIC_FL As Integer, BASIC_ID As Integer
    Dim BASIC_I As Single, BASIC_VA As Integer

    ' [8005-8006]
    CCPlotBegin: CCSend 15: CCSend 6: CCSend 7
    CCPlotBegin: CCSend 3: CCSend 69: CCSend 1: CCWriteText "MEMORY"
    ' [8010]
    BASIC_AD = BASIC_WD: DIVERGosub6600: DIVERGosub6700
    ' [8020-8060]
    BASIC_CO = 1: BASIC_FL = 0
    BASIC_ID = 1: BASIC_VA = Int(BASIC_BT / 100) + 48: If BASIC_VA = 48 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 2: BASIC_I = Int(BASIC_BT - Int(BASIC_BT / 100) * 100): BASIC_VA = Int(BASIC_I / 10) + 48: If BASIC_VA = 48 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 3: BASIC_VA = BASIC_I - Int(BASIC_I / 10) * 10 + 48: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 4: BASIC_VA = 58: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 5: BASIC_I = (BASIC_BT - Int(BASIC_BT)) * 60: BASIC_VA = Int(BASIC_I / 10) + 48: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 6: BASIC_VA = BASIC_I - Int(BASIC_I / 10) * 10 + 48: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    ' [8062-8073]
    If BASIC_WM < 10 Then BASIC_NS = 0
    If BASIC_NS >= 0 Then
        BASIC_VA = 32
        For BASIC_ID = 7 To 12: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL: Next BASIC_ID
        If BASIC_NS <> 0 Then
            BASIC_CO = 0
            BASIC_ID = 13: BASIC_VA = 82: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
            BASIC_ID = 14: BASIC_VA = 78: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
            BASIC_ID = 15: BASIC_VA = 83: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
            BASIC_ID = 16: BASIC_VA = Int(BASIC_NS / 100) + 48: If BASIC_VA = 48 Then BASIC_VA = 32
            DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
            BASIC_ID = 17: BASIC_I = BASIC_NS - Int(BASIC_NS / 100) * 100: BASIC_VA = Int(BASIC_I / 10) + 48: If BASIC_NS < 100 And BASIC_VA = 48 Then BASIC_VA = 32
            DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
            BASIC_ID = 18: BASIC_VA = BASIC_I - Int(BASIC_I / 10) * 10 + 48: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
        End If
        Exit Sub
    End If
    ' [8074-8090]
    BASIC_D5 = BASIC_E5: BASIC_DX = BASIC_EX: BASIC_CO = 1
    BASIC_ID = 7: BASIC_VA = 49: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 8: BASIC_VA = 48: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 9: BASIC_VA = 77: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_CO = 0
    BASIC_ID = 10: BASIC_VA = Int(BASIC_DX / 10) + 48: If BASIC_VA = 48 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 11: BASIC_VA = BASIC_DX - Int(BASIC_DX / 10) * 10 + 48: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 12: BASIC_VA = 58: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_CO = 1
    BASIC_ID = 13: BASIC_VA = 53: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 14: BASIC_VA = 77: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 15: BASIC_VA = 32: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_CO = 0
    BASIC_ID = 16: BASIC_VA = Int(BASIC_D5 / 10) + 48: If BASIC_VA = 48 Then BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 17: BASIC_VA = BASIC_D5 - Int(BASIC_D5 / 10) * 10 + 48: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
    BASIC_ID = 18: BASIC_VA = 32: DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, BASIC_CO, BASIC_FL
End Sub


Sub DIVERDisplayDepthTrend (BASIC_VA As Integer, BASIC_FL As Integer)
    Dim BASIC_I As Integer

    ' [7200-7204] Clear all ten depth-trend bars in black.
    CCPlotBegin
    CCSend 6
    CCSend 0
    CCSend 2
    CCSend 250
    CCSend 152
    For BASIC_I = 1 To 10
        CCPlotBegin
        CCSend 166 - 2 * BASIC_I
        CCSend 155
    Next BASIC_I
    CCPlotBegin
    CCSend 255

    ' [7205] VA=0 on the initial call, so no red bars are repainted.
    If BASIC_VA = 0 Then Exit Sub

    ' [7210-7240] Repaint INT(VA) bars in red, or blinking red when FL=64.
    CCPlotBegin
    CCSend 6
    CCSend 1 + BASIC_FL
    CCSend 2
    CCSend 250
    CCSend 152
    For BASIC_I = 1 To BASIC_VA
        CCPlotBegin
        CCSend 166 - 2 * BASIC_I
        CCSend 155
    Next BASIC_I
    CCPlotBegin
    CCSend 255
End Sub


Sub DIVERDisplayAirGauge (BASIC_VA As Integer, BASIC_FL As Integer)
    Dim BASIC_I As Integer

    ' [7301-7304] Clear all eighteen air-gauge positions in black.
    CCPlotBegin
    CCSend 6
    CCSend 0
    CCSend 2
    CCSend 250
    CCSend 133
    For BASIC_I = 1 To 18
        CCPlotBegin
        CCSend 183 - 2 * BASIC_I
        CCSend 134
    Next BASIC_I
    CCPlotBegin
    CCSend 255

    ' [7305-7308] Repaint the lower three positions in magenta.
    CCPlotBegin
    CCSend 6
    CCSend 5
    CCSend 2
    CCSend 250
    CCSend 133
    For BASIC_I = 16 To 18
        CCPlotBegin
        CCSend 185 - 2 * BASIC_I
        CCSend 134
    Next BASIC_I
    CCPlotBegin
    CCSend 255

    ' [7310-7342] Repaint INT(VA) positions in green.
    If Int(BASIC_VA) = 0 Then Exit Sub
    CCPlotBegin
    CCSend 6
    CCSend 2 + BASIC_FL
    CCSend 2
    CCSend 250
    CCSend 133
    For BASIC_I = 1 To BASIC_VA
        CCPlotBegin
        CCSend 153 + 2 * BASIC_I
        CCSend 134
    Next BASIC_I
    CCPlotBegin
    CCSend 255
End Sub


Sub DIVERWriteVerticalLegend
    Dim SavedMode As Integer
    Dim SavedColumn As Integer
    Dim SavedRow As Integer
    Dim SavedDirection As Integer
    Dim SavedLarge As Integer

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

    CCGraphicsColour(14, 15) = -1
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
End Sub


Sub DIVERDisplayMonitorCell (BASIC_ID As Integer, BASIC_VA As Integer, BASIC_CO As Integer, BASIC_FL As Integer)
    Dim GaugeHandled As Integer

    ' Translation of the GOSUB 7000 paths required by IDs 1-22.

    ' [7100] IF FL=1 THEN FL=64
    If BASIC_FL = 1 Then BASIC_FL = 64

    ' [7110] PLOT 14
    CCPlotBegin
    CCSend 14

    ' [7120,7300-7342] ID=22 is the air-left bar gauge.
    If BASIC_ID = 22 Then
        DIVERDisplayAirGauge BASIC_VA, BASIC_FL
        GaugeHandled = -1
    End If

    ' [7130,7200-7240] ID=21 is the fractional-depth trend gauge.
    If BASIC_ID = 21 And Not GaugeHandled Then
        DIVERDisplayDepthTrend BASIC_VA, BASIC_FL
        GaugeHandled = -1
    End If

    If GaugeHandled Then
        ' [7440-7451] Common gauge cleanup and return.
        CCPlotBegin
        CCSend 15
        CCPlotBegin
        CCSend 3
        CCSend 80
        CCSend 0
        Exit Sub
    End If

    If BASIC_ID >= 19 Then
        ' [7131,7250] Depth digits use CCI 1 and columns 57+ID on row 4.
        CCPlotBegin
        CCSend 6
        CCSend 1 + BASIC_FL
        CCSend 3
        CCSend 57 + BASIC_ID
        CCSend 4
    ElseIf BASIC_ID >= 13 Then
        ' [7135,7160] IDs 13-18 use columns 56+ID on row 9.
        CCPlotBegin
        CCSend 3
        CCSend 56 + BASIC_ID
        CCSend 9

        ' [7165-7168] CO selects green or yellow for rows two and three.
        CCPlotBegin
        CCSend 6
        If BASIC_CO = 1 Then
            CCSend 2 + BASIC_FL
        Else
            CCSend 3 + BASIC_FL
        End If
    ElseIf BASIC_ID >= 7 Then
        ' [7140,7150] IDs 7-12 use columns 62+ID on row 7.
        CCPlotBegin
        CCSend 3
        CCSend 62 + BASIC_ID
        CCSend 7

        ' [7165-7168] CO selects green or yellow for rows two and three.
        CCPlotBegin
        CCSend 6
        If BASIC_CO = 1 Then
            CCSend 2 + BASIC_FL
        Else
            CCSend 3 + BASIC_FL
        End If
    Else
        ' [7145] IDs 1-6 use columns 68+ID on row 4.
        CCPlotBegin
        CCSend 3
        CCSend 68 + BASIC_ID
        CCSend 4

        ' [7147-7149] CO selects green or magenta.
        CCPlotBegin
        CCSend 6
        If BASIC_CO = 1 Then
            CCSend 2 + BASIC_FL
        Else
            CCSend 5 + BASIC_FL
        End If
    End If

    ' [7170-7180] Clamp to a printable character and PLOT VA.
    If BASIC_VA > 95 Then BASIC_VA = 63
    If BASIC_VA < 32 Then BASIC_VA = 63
    CCPlotBegin
    CCSend BASIC_VA

    ' [7440-7451] Restore normal characters and move the cursor off-screen.
    CCPlotBegin
    CCSend 15
    CCPlotBegin
    CCSend 3
    CCSend 80
    CCSend 0
End Sub


Function CCTextSlice$ (StartColumn As Integer, Row As Integer, CharacterCount As Integer)
    Dim Index As Integer
    Dim Column As Integer
    Dim CharacterCode As Integer
    Dim Result As String

    For Index = 0 To CharacterCount - 1
        Column = StartColumn + Index
        CharacterCode = 32
        If Column >= 0 And Column < CC_TEXT_COLS And Row >= 0 And Row < CC_TEXT_ROWS Then
            If CCCellKind(Column, Row) = CC_CELL_TEXT Then CharacterCode = CCTextCode(Column, Row)
        End If
        If CharacterCode < 32 Or CharacterCode > 126 Then CharacterCode = 63
        Result = Result + Chr$(CharacterCode)
    Next Index

    CCTextSlice$ = Result
End Function
